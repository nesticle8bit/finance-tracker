namespace Finance.Tracker.Shared.DataTransferObjects.Authentication
{
    public class LoginUserDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
