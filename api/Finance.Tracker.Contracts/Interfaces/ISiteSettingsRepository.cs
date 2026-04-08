using Finance.Tracker.Entities.Settings;

namespace Finance.Tracker.Contracts.Interfaces
{
    public interface ISiteSettingsRepository
    {
        Task<SiteSettings?> Get(bool trackChanges);
        void Create(SiteSettings settings);
        void Update(SiteSettings settings);
    }
}
