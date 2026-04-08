using Finance.Tracker.Contracts.Interfaces;
using Finance.Tracker.Entities.Parameters;
using Finance.Tracker.Repository.RepositoryBase;
using Microsoft.EntityFrameworkCore;

namespace Finance.Tracker.Repository.Repositories
{
    public class CategoryRepository(RepositoryContext context) : RepositoryBase<Category>(context), ICategoryRepository
    {
        public IQueryable<Category> FindByUser(Guid userId, bool trackChanges) =>
            FindByCondition(c => c.UserId == userId, trackChanges)
                .OrderBy(c => c.Name);

        public async Task<Category?> FindById(Guid id, Guid userId, bool trackChanges) =>
            await FindByCondition(c => c.Id == id && c.UserId == userId, trackChanges)
                .FirstOrDefaultAsync();

        void ICategoryRepository.Create(Category category) => Create(category);
        void ICategoryRepository.Update(Category category) => Update(category);
        void ICategoryRepository.Delete(Category category) => Delete(category);
    }
}
