namespace Finance.Tracker.Shared.DataTransferObjects.Authentication
{
    public class UserUpdateDto : UserCreateDto
    {
        public required string Id { get; set; }
    }
}
