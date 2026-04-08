using Finance.Tracker.Shared.DataTransferObjects.Export;

namespace Finance.Tracker.Service.Contracts.Services
{
    public interface IImportService
    {
        Task<ImportResultDto> ImportUserData(UserExportDto dto);
    }
}
