using Finance.Tracker.Contracts.Interfaces;
using Finance.Tracker.Entities.Finance;
using Finance.Tracker.Repository.RepositoryBase;
using Microsoft.EntityFrameworkCore;

namespace Finance.Tracker.Repository.Repositories
{
    public class TransactionRepository(RepositoryContext context) : RepositoryBase<Transaction>(context), ITransactionRepository
    {
        public IQueryable<Transaction> FindByUser(Guid userId, bool trackChanges) =>
            FindByCondition(t => t.UserId == userId, trackChanges)
                .Include(t => t.Category)
                .OrderByDescending(t => t.Date);

        public async Task<Transaction?> FindById(Guid id, Guid userId, bool trackChanges) =>
            await FindByCondition(t => t.Id == id && t.UserId == userId, trackChanges)
                .Include(t => t.Category)
                .FirstOrDefaultAsync();

        void ITransactionRepository.Create(Transaction transaction) => Create(transaction);
        void ITransactionRepository.Update(Transaction transaction) => Update(transaction);
        void ITransactionRepository.Delete(Transaction transaction) => Delete(transaction);
    }
}
