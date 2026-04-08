using Finance.Tracker.Entities.Authentication;
using Finance.Tracker.Entities.Parameters;
using System.ComponentModel.DataAnnotations.Schema;

namespace Finance.Tracker.Entities.Finance
{
    [Table("categoryLimit", Schema = "finance")]
    public class CategoryLimit
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public Guid CategoryId { get; set; }
        public decimal Limit { get; set; }
        public User User { get; set; } = null!;
        public Category Category { get; set; } = null!;
    }
}
