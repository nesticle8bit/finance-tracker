namespace Finance.Tracker.Shared.DataTransferObjects.Admin
{
    public class AdminUpdateUserDto
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public string Role { get; set; } = "user";
        public string? Password { get; set; }
    }
}
