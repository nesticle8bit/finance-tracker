using Finance.Tracker.Contracts.Manager;
using Finance.Tracker.Service.Contracts.Services;
using Finance.Tracker.Shared.DataTransferObjects.Authentication;
using Finance.Tracker.Shared.DataTransferObjects.Export;
using Finance.Tracker.Shared.DataTransferObjects.Finance;
using Finance.Tracker.Shared.Transversal;
using System.Text;

namespace Finance.Tracker.Service.Services
{
    public class ExportService(IRepositoryManager repository, IAppPrincipal appPrincipal) : IExportService
    {
        private readonly IRepositoryManager _repository = repository;
        private readonly IAppPrincipal _appPrincipal = appPrincipal;

        private Guid UserId => Guid.Parse(_appPrincipal.Id);

        public async Task<UserExportDto> ExportUserData()
        {
            var users = await _repository.UserRepository.FindUsers(new UserSearchDto { UserId = _appPrincipal.Id }, false);
            var user = users.FirstOrDefault() ?? throw new Exception("User not found.");

            var categories = _repository.CategoryRepository.FindByUser(UserId, false)
                .Select(c => new CategoryResponseDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Icon = c.Icon,
                    Color = c.Color,
                    Type = c.Type,
                    IsDefault = c.IsDefault
                }).ToList();

            var transactions = _repository.TransactionRepository.FindByUser(UserId, false)
                .Select(t => new TransactionResponseDto
                {
                    Id = t.Id,
                    CategoryId = t.CategoryId,
                    CategoryName = t.Category.Name,
                    CategoryIcon = t.Category.Icon,
                    CategoryColor = t.Category.Color,
                    Desc = t.Desc,
                    Amount = t.Amount,
                    Type = t.Type,
                    Date = t.Date,
                    CreatedAt = t.CreatedAt
                }).ToList();

            var limits = _repository.BudgetRepository.FindLimitsByUser(UserId, false)
                .Select(cl => new CategoryLimitResponseDto
                {
                    Id = cl.Id,
                    CategoryId = cl.CategoryId,
                    CategoryName = cl.Category.Name,
                    CategoryIcon = cl.Category.Icon,
                    CategoryColor = cl.Category.Color,
                    Limit = cl.Limit
                }).ToList();

            BudgetResponseDto? budget = null;
            var budgetEntity = await _repository.BudgetRepository.FindBudget(UserId, false);
            if (budgetEntity is not null)
                budget = new BudgetResponseDto { Id = budgetEntity.Id, Amount = budgetEntity.Budget };

            return new UserExportDto
            {
                Profile = new UserResponseDto
                {
                    Id = user.Id.ToString(),
                    Email = user.Email,
                    Name = user.Name,
                    CreatedAt = user.CreatedAt
                },
                Categories = categories,
                Transactions = transactions,
                CategoryLimits = limits,
                Budget = budget
            };
        }

        public async Task<string> BuildCsvExport()
        {
            var data = await ExportUserData();
            var sb = new StringBuilder();

            // Profile
            sb.AppendLine("# PROFILE");
            sb.AppendLine("Id,Name,Email,CreatedAt");
            sb.AppendLine($"{Csv(data.Profile.Id)},{Csv(data.Profile.Name)},{Csv(data.Profile.Email)},{data.Profile.CreatedAt:yyyy-MM-dd HH:mm:ss}");

            // Transactions
            sb.AppendLine();
            sb.AppendLine("# TRANSACTIONS");
            sb.AppendLine("Id,Date,Type,Amount,Category,Description,CreatedAt");
            foreach (var t in data.Transactions)
                sb.AppendLine($"{t.Id},{t.Date:yyyy-MM-dd},{Csv(t.Type)},{t.Amount},{Csv(t.CategoryName)},{Csv(t.Desc)},{t.CreatedAt:yyyy-MM-dd HH:mm:ss}");

            // Categories
            sb.AppendLine();
            sb.AppendLine("# CATEGORIES");
            sb.AppendLine("Id,Name,Icon,Color,Type,IsDefault");
            foreach (var c in data.Categories)
                sb.AppendLine($"{c.Id},{Csv(c.Name)},{Csv(c.Icon)},{Csv(c.Color)},{Csv(c.Type)},{c.IsDefault}");

            // Budget
            sb.AppendLine();
            sb.AppendLine("# BUDGET");
            sb.AppendLine("Id,Budget");
            if (data.Budget is not null)
                sb.AppendLine($"{data.Budget.Id},{data.Budget.Amount}");

            // Category Limits
            sb.AppendLine();
            sb.AppendLine("# CATEGORY LIMITS");
            sb.AppendLine("Id,CategoryId,CategoryName,Limit");
            foreach (var cl in data.CategoryLimits)
                sb.AppendLine($"{cl.Id},{cl.CategoryId},{Csv(cl.CategoryName)},{cl.Limit}");

            return sb.ToString();
        }

        private static string Csv(string value)
        {
            if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
                return $"\"{value.Replace("\"", "\"\"")}\"";
            return value;
        }
    }
}
