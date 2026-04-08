using Finance.Tracker.Contracts.Interfaces;
using Finance.Tracker.Entities.Finance;
using Finance.Tracker.Repository.RepositoryBase;
using Microsoft.EntityFrameworkCore;

namespace Finance.Tracker.Repository.Repositories
{
    public class BudgetRepository(RepositoryContext context) : RepositoryBase<BudgetConfig>(context), IBudgetRepository
    {
        public async Task<BudgetConfig?> FindBudget(Guid userId, bool trackChanges) =>
            await FindByCondition(b => b.UserId == userId, trackChanges).FirstOrDefaultAsync();

        public void CreateBudget(BudgetConfig budget) => Create(budget);

        public void UpdateBudget(BudgetConfig budget) => Update(budget);

        public IQueryable<CategoryLimit> FindLimitsByUser(Guid userId, bool trackChanges) =>
            RepositoryContext.CategoryLimits
                .Where(cl => cl.UserId == userId)
                .Include(cl => cl.Category);

        public async Task<CategoryLimit?> FindLimit(Guid userId, Guid categoryId, bool trackChanges) =>
            await RepositoryContext.CategoryLimits
                .Where(cl => cl.UserId == userId && cl.CategoryId == categoryId)
                .Include(cl => cl.Category)
                .FirstOrDefaultAsync();

        public void CreateLimit(CategoryLimit limit) => RepositoryContext.CategoryLimits.Add(limit);

        public void UpdateLimit(CategoryLimit limit) => RepositoryContext.CategoryLimits.Update(limit);
    }
}
