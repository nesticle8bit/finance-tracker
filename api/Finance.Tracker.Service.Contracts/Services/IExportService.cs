using Finance.Tracker.Shared.DataTransferObjects.Export;

namespace Finance.Tracker.Service.Contracts.Services
{
    public interface IExportService
    {
        Task<UserExportDto> ExportUserData();

        Task<string> BuildCsvExport();
    }
}
