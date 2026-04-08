namespace Finance.Tracker.Shared.DataTransferObjects.Authentication
{
    public class UserUpdateDto : UserCreateDto
    {
        public required string Id { get; set; }
        public string Role { get; set; } = "user";
    }
}
