namespace Finance.Tracker.Shared.DataTransferObjects.Authentication
{
    public class UserResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string Role { get; set; } = "user";
        public DateTime? LastSeenAt { get; set; }
        public bool IsOnline => LastSeenAt.HasValue && (DateTime.UtcNow - LastSeenAt.Value).TotalMinutes <= 5;
    }
}
