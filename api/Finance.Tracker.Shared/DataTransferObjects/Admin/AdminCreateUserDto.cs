namespace Finance.Tracker.Shared.DataTransferObjects.Admin
{
    public class AdminCreateUserDto
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public string Role { get; set; } = "user";
    }
}
