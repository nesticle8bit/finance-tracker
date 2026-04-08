namespace Finance.Tracker.Shared.DataTransferObjects.Authentication
{
    public class UpdateProfileDto
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
    }
}
