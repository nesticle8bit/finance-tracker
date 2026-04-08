using Finance.Tracker.Contracts.Manager;
using Finance.Tracker.Entities.Finance;
using Finance.Tracker.Service.Contracts.Services;
using Finance.Tracker.Shared.DataTransferObjects.Finance;
using Finance.Tracker.Shared.Transversal;

namespace Finance.Tracker.Service.Services
{
    public class BudgetService(IRepositoryManager repository, IAppPrincipal appPrincipal) : IBudgetService
    {
        private readonly IRepositoryManager _repository = repository;
        private readonly IAppPrincipal _appPrincipal = appPrincipal;

        private Guid UserId => Guid.Parse(_appPrincipal.Id);

        public async Task<BudgetResponseDto> GetBudget()
        {
            var budget = await _repository.BudgetRepository.FindBudget(UserId, false)
                ?? throw new Exception("Budget config not found.");

            return new BudgetResponseDto { Id = budget.Id, Amount = budget.Budget };
        }

        public async Task<BudgetResponseDto> UpdateBudget(BudgetUpdateDto dto)
        {
            var budget = await _repository.BudgetRepository.FindBudget(UserId, true)
                ?? throw new Exception("Budget config not found.");

            budget.Budget = dto.Amount;
            _repository.BudgetRepository.UpdateBudget(budget);
            _repository.Save();

            return new BudgetResponseDto { Id = budget.Id, Amount = budget.Budget };
        }

        public async Task<IEnumerable<CategoryLimitResponseDto>> GetCategoryLimits()
        {
            var limits = _repository.BudgetRepository.FindLimitsByUser(UserId, false).ToList();

            return limits.Select(MapLimitToDto);
        }

        public async Task<CategoryLimitResponseDto> SetCategoryLimit(Guid categoryId, CategoryLimitUpdateDto dto)
        {
            var existing = await _repository.BudgetRepository.FindLimit(UserId, categoryId, true);

            if (existing is null)
            {
                var newLimit = new CategoryLimit
                {
                    UserId = UserId,
                    CategoryId = categoryId,
                    Limit = dto.Limit
                };

                _repository.BudgetRepository.CreateLimit(newLimit);
                _repository.Save();

                var created = await _repository.BudgetRepository.FindLimit(UserId, categoryId, false)
                    ?? throw new Exception("Limit not found after creation.");

                return MapLimitToDto(created);
            }

            existing.Limit = dto.Limit;
            _repository.BudgetRepository.UpdateLimit(existing);
            _repository.Save();

            var updated = await _repository.BudgetRepository.FindLimit(UserId, categoryId, false)
                ?? throw new Exception("Limit not found after update.");

            return MapLimitToDto(updated);
        }

        private static CategoryLimitResponseDto MapLimitToDto(CategoryLimit cl) => new()
        {
            Id = cl.Id,
            CategoryId = cl.CategoryId,
            CategoryName = cl.Category.Name,
            CategoryIcon = cl.Category.Icon,
            CategoryColor = cl.Category.Color,
            Limit = cl.Limit
        };
    }
}
