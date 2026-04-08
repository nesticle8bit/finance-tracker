using Finance.Tracker.Contracts.Interfaces;

namespace Finance.Tracker.Contracts.Manager
{
    public interface IRepositoryManager
    {
        IUserRepository UserRepository { get; }
        ITransactionRepository TransactionRepository { get; }
        ICategoryRepository CategoryRepository { get; }
        IBudgetRepository BudgetRepository { get; }

        void Save();
    }
}
