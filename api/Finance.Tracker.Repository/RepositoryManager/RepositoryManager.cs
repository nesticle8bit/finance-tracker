using Finance.Tracker.Contracts.Interfaces;
using Finance.Tracker.Contracts.Manager;
using Finance.Tracker.Repository.Repositories;
using Finance.Tracker.Repository.Seed;

namespace Finance.Tracker.Repository.RepositoryManager
{
    public sealed class RepositoryManager(RepositoryContext repositoryContext, SeedService seed) : IRepositoryManager
    {
        private readonly RepositoryContext _repositoryContext = repositoryContext;

        private readonly Lazy<IUserRepository> _userRepository = new(() =>
            new AuthenticationRepository(repositoryContext, seed));

        private readonly Lazy<ITransactionRepository> _transactionRepository = new(() =>
            new TransactionRepository(repositoryContext));

        private readonly Lazy<ICategoryRepository> _categoryRepository = new(() =>
            new CategoryRepository(repositoryContext));

        private readonly Lazy<IBudgetRepository> _budgetRepository = new(() =>
            new BudgetRepository(repositoryContext));

        public IUserRepository UserRepository => _userRepository.Value;
        public ITransactionRepository TransactionRepository => _transactionRepository.Value;
        public ICategoryRepository CategoryRepository => _categoryRepository.Value;
        public IBudgetRepository BudgetRepository => _budgetRepository.Value;

        public void Save() => _repositoryContext.SaveChanges();
    }
}
