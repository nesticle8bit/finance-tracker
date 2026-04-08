using Finance.Tracker.Contracts.Manager;
using Finance.Tracker.Entities.Settings;
using Finance.Tracker.Service.Contracts.Services;
using Finance.Tracker.Shared.DataTransferObjects.SiteSettings;

namespace Finance.Tracker.Service.Services
{
    public class SiteSettingsService(IRepositoryManager repository) : ISiteSettingsService
    {
        private readonly IRepositoryManager _repository = repository;

        public async Task<SiteSettingsDto> GetSettings()
        {
            var settings = await _repository.SiteSettingsRepository.Get(false)
                ?? new SiteSettings();
            return MapToDto(settings);
        }

        public async Task<SiteSettingsDto> UpdateSettings(SiteSettingsDto dto)
        {
            var settings = await _repository.SiteSettingsRepository.Get(true);

            if (settings is null)
            {
                settings = new SiteSettings();
                MapFromDto(dto, settings);
                _repository.SiteSettingsRepository.Create(settings);
            }
            else
            {
                MapFromDto(dto, settings);
                _repository.SiteSettingsRepository.Update(settings);
            }

            _repository.Save();
            return MapToDto(settings);
        }

        private static SiteSettingsDto MapToDto(SiteSettings s) => new()
        {
            SiteName = s.SiteName,
            Slogan = s.Slogan,
            LoginSubtitle = s.LoginSubtitle,
            Feature1Title = s.Feature1Title,
            Feature1Desc = s.Feature1Desc,
            Feature2Title = s.Feature2Title,
            Feature2Desc = s.Feature2Desc,
            Feature3Title = s.Feature3Title,
            Feature3Desc = s.Feature3Desc
        };

        private static void MapFromDto(SiteSettingsDto dto, SiteSettings s)
        {
            s.SiteName = dto.SiteName;
            s.Slogan = dto.Slogan;
            s.LoginSubtitle = dto.LoginSubtitle;
            s.Feature1Title = dto.Feature1Title;
            s.Feature1Desc = dto.Feature1Desc;
            s.Feature2Title = dto.Feature2Title;
            s.Feature2Desc = dto.Feature2Desc;
            s.Feature3Title = dto.Feature3Title;
            s.Feature3Desc = dto.Feature3Desc;
        }
    }
}
