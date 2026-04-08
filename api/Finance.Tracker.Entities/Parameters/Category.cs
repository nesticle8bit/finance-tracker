using Finance.Tracker.Entities.Authentication;
using Finance.Tracker.Entities.Finance;
using System.ComponentModel.DataAnnotations.Schema;

namespace Finance.Tracker.Entities.Parameters
{
    [Table("categories", Schema = "parameters")]
    public class Category
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Icon { get; set; } = "more_horiz";
        public string Color { get; set; } = "#6b7280";
        public string Type { get; set; } = "expense";
        public bool IsDefault { get; set; } = false;

        public User User { get; set; } = null!;
        public ICollection<Transaction> Transactions { get; set; } = [];
        public ICollection<CategoryLimit> Limits { get; set; } = [];
    }
}
