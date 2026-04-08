namespace Finance.Tracker.Shared.DataTransferObjects.Finance
{
    public class CategoryUpdateDto
    {
        public required string Name { get; set; }
        public string Icon { get; set; } = "more_horiz";
        public string Color { get; set; } = "#6b7280";
        public required string Type { get; set; }
    }
}
