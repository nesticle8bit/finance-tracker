using Finance.Tracker.Entities.Authentication;
using Finance.Tracker.Entities.Parameters;
using System.ComponentModel.DataAnnotations.Schema;

namespace Finance.Tracker.Entities.Finance
{
    [Table("transactions", Schema = "finance")]
    public class Transaction
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public Guid CategoryId { get; set; }
        public string Desc { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Type { get; set; } = "expense";
        public DateOnly Date { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
        public Category Category { get; set; } = null!;
    }
}
