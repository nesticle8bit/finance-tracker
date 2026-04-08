using Finance.Tracker.Contracts.Manager;
using Finance.Tracker.Entities.Finance;
using Finance.Tracker.Entities.Parameters;
using Finance.Tracker.Service.Contracts.Services;
using Finance.Tracker.Shared.DataTransferObjects.Export;
using Finance.Tracker.Shared.Transversal;

namespace Finance.Tracker.Service.Services
{
    public class ImportService(IRepositoryManager repository, IAppPrincipal appPrincipal) : IImportService
    {
        private readonly IRepositoryManager _repository = repository;
        private readonly IAppPrincipal _appPrincipal = appPrincipal;

        private Guid UserId => Guid.Parse(_appPrincipal.Id);

        public async Task<ImportResultDto> ImportUserData(UserExportDto dto)
        {
            var result = new ImportResultDto();

            // 1. Import categories — assign new IDs and track the old→new mapping
            var categoryIdMap = new Dictionary<Guid, Guid>();

            foreach (var c in dto.Categories)
            {
                var newId = Guid.NewGuid();
                categoryIdMap[c.Id] = newId;

                _repository.CategoryRepository.Create(new Category
                {
                    Id = newId,
                    UserId = UserId,
                    Name = c.Name,
                    Icon = c.Icon,
                    Color = c.Color,
                    Type = c.Type,
                    IsDefault = false
                });

                result.CategoriesImported++;
            }

            _repository.Save();

            // 2. Import transactions — remap CategoryId via the map; skip if category wasn't imported
            foreach (var t in dto.Transactions)
            {
                if (!categoryIdMap.TryGetValue(t.CategoryId, out var mappedCategoryId))
                    continue;

                _repository.TransactionRepository.Create(new Transaction
                {
                    Id = Guid.NewGuid(),
                    UserId = UserId,
                    CategoryId = mappedCategoryId,
                    Desc = t.Desc,
                    Amount = t.Amount,
                    Type = t.Type,
                    Date = t.Date,
                    CreatedAt = t.CreatedAt
                });

                result.TransactionsImported++;
            }

            _repository.Save();

            // 3. Import budget — update existing or create new
            if (dto.Budget is not null)
            {
                var existing = await _repository.BudgetRepository.FindBudget(UserId, true);

                if (existing is not null)
                {
                    existing.Budget = dto.Budget.Amount;
                    _repository.BudgetRepository.UpdateBudget(existing);
                }
                else
                {
                    _repository.BudgetRepository.CreateBudget(new BudgetConfig
                    {
                        Id = Guid.NewGuid(),
                        UserId = UserId,
                        Budget = dto.Budget.Amount
                    });
                }

                _repository.Save();
                result.BudgetImported = true;
            }

            // 4. Import category limits — remap CategoryId via the map; skip if category wasn't imported
            foreach (var cl in dto.CategoryLimits)
            {
                if (!categoryIdMap.TryGetValue(cl.CategoryId, out var mappedCategoryId))
                    continue;

                var existingLimit = await _repository.BudgetRepository.FindLimit(UserId, mappedCategoryId, true);

                if (existingLimit is not null)
                {
                    existingLimit.Limit = cl.Limit;
                    _repository.BudgetRepository.UpdateLimit(existingLimit);
                }
                else
                {
                    _repository.BudgetRepository.CreateLimit(new CategoryLimit
                    {
                        Id = Guid.NewGuid(),
                        UserId = UserId,
                        CategoryId = mappedCategoryId,
                        Limit = cl.Limit
                    });
                }

                result.CategoryLimitsImported++;
            }

            _repository.Save();

            return result;
        }
    }
}
