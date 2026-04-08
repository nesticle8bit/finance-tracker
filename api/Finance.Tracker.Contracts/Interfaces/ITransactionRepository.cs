using Finance.Tracker.Entities.Finance;

namespace Finance.Tracker.Contracts.Interfaces
{
    public interface ITransactionRepository
    {
        IQueryable<Transaction> FindByUser(Guid userId, bool trackChanges);
        Task<Transaction?> FindById(Guid id, Guid userId, bool trackChanges);
        void Create(Transaction transaction);
        void Update(Transaction transaction);
        void Delete(Transaction transaction);
    }
}
