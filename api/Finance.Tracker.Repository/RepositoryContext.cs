using Finance.Tracker.Entities.Authentication;
using Finance.Tracker.Entities.Finance;
using Finance.Tracker.Entities.Parameters;
using Microsoft.EntityFrameworkCore;

namespace Finance.Tracker.Repository
{
    public class RepositoryContext(DbContextOptions options) : DbContext(options)
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Transaction> Transactions => Set<Transaction>();
        public DbSet<BudgetConfig> BudgetConfigs => Set<BudgetConfig>();
        public DbSet<CategoryLimit> CategoryLimits => Set<CategoryLimit>();

        protected override void OnModelCreating(ModelBuilder mb)
        {
            // User
            mb.Entity<User>().HasIndex(u => u.Email).IsUnique();

            // Category
            mb.Entity<Category>()
              .HasOne(c => c.User).WithMany(u => u.Categories)
              .HasForeignKey(c => c.UserId).OnDelete(DeleteBehavior.Cascade);

            // Transaction
            mb.Entity<Transaction>()
              .HasOne(t => t.User).WithMany(u => u.Transactions)
              .HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.Cascade);

            mb.Entity<Transaction>()
              .HasOne(t => t.Category).WithMany(c => c.Transactions)
              .HasForeignKey(t => t.CategoryId).OnDelete(DeleteBehavior.Restrict);

            mb.Entity<Transaction>()
              .Property(t => t.Amount).HasPrecision(18, 2);

            // BudgetConfig — one-to-one
            mb.Entity<BudgetConfig>()
              .HasOne(b => b.User).WithOne(u => u.BudgetConfig)
              .HasForeignKey<BudgetConfig>(b => b.UserId).OnDelete(DeleteBehavior.Cascade);

            mb.Entity<BudgetConfig>()
              .Property(b => b.Budget).HasPrecision(18, 2);

            // CategoryLimit
            mb.Entity<CategoryLimit>()
              .HasOne(cl => cl.User).WithMany(u => u.CategoryLimits)
              .HasForeignKey(cl => cl.UserId).OnDelete(DeleteBehavior.Cascade);

            mb.Entity<CategoryLimit>()
              .HasOne(cl => cl.Category).WithMany(c => c.Limits)
              .HasForeignKey(cl => cl.CategoryId).OnDelete(DeleteBehavior.Cascade);

            mb.Entity<CategoryLimit>()
              .HasIndex(cl => new { cl.UserId, cl.CategoryId }).IsUnique();

            mb.Entity<CategoryLimit>()
              .Property(cl => cl.Limit).HasPrecision(18, 2);

            base.OnModelCreating(mb);
        }
    }
}
