using Finance.Tracker.Shared.DataTransferObjects.Authentication;
using Finance.Tracker.Shared.DataTransferObjects.Finance;

namespace Finance.Tracker.Shared.DataTransferObjects.Export
{
    public class UserExportDto
    {
        public UserResponseDto Profile { get; set; } = new();
        public IEnumerable<CategoryResponseDto> Categories { get; set; } = [];
        public IEnumerable<TransactionResponseDto> Transactions { get; set; } = [];
        public BudgetResponseDto? Budget { get; set; }
        public IEnumerable<CategoryLimitResponseDto> CategoryLimits { get; set; } = [];
    }
}
