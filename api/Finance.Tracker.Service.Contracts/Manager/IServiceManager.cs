using Finance.Tracker.Service.Contracts.Services;

namespace Finance.Tracker.Service.Contracts.Manager
{
    public interface IServiceManager
    {
        IAuthenticationService AuthenticationService { get; }
        ITransactionService TransactionService { get; }
        ICategoryService CategoryService { get; }
        IBudgetService BudgetService { get; }
        IExportService ExportService { get; }
        IImportService ImportService { get; }
    }
}
