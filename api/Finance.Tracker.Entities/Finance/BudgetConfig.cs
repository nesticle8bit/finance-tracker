using Finance.Tracker.Entities.Authentication;
using System.ComponentModel.DataAnnotations.Schema;

namespace Finance.Tracker.Entities.Finance
{
    [Table("budgetConfig", Schema = "finance")]
    public class BudgetConfig
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public decimal Budget { get; set; } = 0;
        public User User { get; set; } = null!;
    }
}
