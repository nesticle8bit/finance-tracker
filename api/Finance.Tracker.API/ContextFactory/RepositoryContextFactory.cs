using Finance.Tracker.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Finance.Tracker.API.ContextFactory
{
    public class RepositoryContextFactory : IDesignTimeDbContextFactory<RepositoryContext>
    {
        public RepositoryContext CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json")
            .Build();

            var builder = new DbContextOptionsBuilder<RepositoryContext>()
                .UseNpgsql(configuration.GetConnectionString("Default"), b => b.MigrationsAssembly("Finance.Tracker.API"));

            return new RepositoryContext(builder.Options);
        }
    }
}
