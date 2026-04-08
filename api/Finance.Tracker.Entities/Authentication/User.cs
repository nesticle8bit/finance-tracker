using Finance.Tracker.Entities.Finance;
using Finance.Tracker.Entities.Parameters;
using System.ComponentModel.DataAnnotations.Schema;

namespace Finance.Tracker.Entities.Authentication
{
    [Table("users", Schema = "authentications")]
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Transaction> Transactions { get; set; } = [];
        public ICollection<Category> Categories { get; set; } = [];
        public ICollection<CategoryLimit> CategoryLimits { get; set; } = [];
        public BudgetConfig? BudgetConfig { get; set; }
    }
}
