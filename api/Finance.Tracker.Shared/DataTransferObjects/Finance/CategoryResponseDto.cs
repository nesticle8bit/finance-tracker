namespace Finance.Tracker.Shared.DataTransferObjects.Finance
{
    public class CategoryResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }
}
