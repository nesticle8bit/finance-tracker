using Finance.Tracker.Shared.DataTransferObjects.Finance;

namespace Finance.Tracker.Service.Contracts.Services
{
    public interface IBudgetService
    {
        Task<BudgetResponseDto> GetBudget();
        Task<BudgetResponseDto> UpdateBudget(BudgetUpdateDto dto);
        Task<IEnumerable<CategoryLimitResponseDto>> GetCategoryLimits();
        Task<CategoryLimitResponseDto> SetCategoryLimit(Guid categoryId, CategoryLimitUpdateDto dto);
    }
}
