using Finance.Tracker.Shared.DataTransferObjects.SiteSettings;

namespace Finance.Tracker.Service.Contracts.Services
{
    public interface ISiteSettingsService
    {
        Task<SiteSettingsDto> GetSettings();
        Task<SiteSettingsDto> UpdateSettings(SiteSettingsDto dto);
    }
}
