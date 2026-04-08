using Finance.Tracker.Entities.Finance;

namespace Finance.Tracker.Contracts.Interfaces
{
    public interface IBudgetRepository
    {
        Task<BudgetConfig?> FindBudget(Guid userId, bool trackChanges);
        void CreateBudget(BudgetConfig budget);
        void UpdateBudget(BudgetConfig budget);
        IQueryable<CategoryLimit> FindLimitsByUser(Guid userId, bool trackChanges);
        Task<CategoryLimit?> FindLimit(Guid userId, Guid categoryId, bool trackChanges);
        void CreateLimit(CategoryLimit limit);
        void UpdateLimit(CategoryLimit limit);
    }
}
