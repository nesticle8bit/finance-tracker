namespace Finance.Tracker.Shared.DataTransferObjects.Finance
{
    public class CategoryLimitResponseDto
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string CategoryIcon { get; set; } = string.Empty;
        public string CategoryColor { get; set; } = string.Empty;
        public decimal Limit { get; set; }
    }
}
