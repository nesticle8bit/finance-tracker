using Finance.Tracker.Contracts.Interfaces;
using Finance.Tracker.Entities.Settings;
using Finance.Tracker.Repository.RepositoryBase;
using Microsoft.EntityFrameworkCore;

namespace Finance.Tracker.Repository.Repositories
{
    public class SiteSettingsRepository(RepositoryContext context) : RepositoryBase<SiteSettings>(context), ISiteSettingsRepository
    {
        public async Task<SiteSettings?> Get(bool trackChanges) =>
            await FindAll(trackChanges).FirstOrDefaultAsync();

        public void Create(SiteSettings settings) => base.Create(settings);

        public void Update(SiteSettings settings) => base.Update(settings);
    }
}
