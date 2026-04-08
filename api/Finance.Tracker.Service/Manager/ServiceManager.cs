using Finance.Tracker.Contracts.Manager;
using Finance.Tracker.Service.Contracts.Manager;
using Finance.Tracker.Service.Contracts.Services;
using Finance.Tracker.Service.Services;
using Finance.Tracker.Shared.Transversal;

namespace Finance.Tracker.Service.Manager
{
    public sealed class ServiceManager(IRepositoryManager repositoryManager, IAppPrincipal appPrincipal) : IServiceManager
    {
        private readonly Lazy<IAuthenticationService> _authenticationService = new(() =>
            new AuthenticationService(repositoryManager, appPrincipal));

        private readonly Lazy<ITransactionService> _transactionService = new(() =>
            new TransactionService(repositoryManager, appPrincipal));

        private readonly Lazy<ICategoryService> _categoryService = new(() =>
            new CategoryService(repositoryManager, appPrincipal));

        private readonly Lazy<IBudgetService> _budgetService = new(() =>
            new BudgetService(repositoryManager, appPrincipal));

        private readonly Lazy<IExportService> _exportService = new(() =>
            new ExportService(repositoryManager, appPrincipal));

        private readonly Lazy<IImportService> _importService = new(() =>
            new ImportService(repositoryManager, appPrincipal));

        public IAuthenticationService AuthenticationService => _authenticationService.Value;
        public ITransactionService TransactionService => _transactionService.Value;
        public ICategoryService CategoryService => _categoryService.Value;
        public IBudgetService BudgetService => _budgetService.Value;
        public IExportService ExportService => _exportService.Value;
        public IImportService ImportService => _importService.Value;
    }
}
