using Finance.Tracker.Entities.Parameters;

namespace Finance.Tracker.Contracts.Interfaces
{
    public interface ICategoryRepository
    {
        IQueryable<Category> FindByUser(Guid userId, bool trackChanges);
        Task<Category?> FindById(Guid id, Guid userId, bool trackChanges);
        void Create(Category category);
        void Update(Category category);
        void Delete(Category category);
    }
}
