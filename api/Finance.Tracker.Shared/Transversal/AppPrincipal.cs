namespace Finance.Tracker.Shared.Transversal
{
    public class AppPrincipal(string id, string userName, string email, string ip, string jwt, string language = "en") : IAppPrincipal
    {
        public string Id { get; set; } = id;
        public string UserName { get; set; } = userName;
        public string Email { get; set; } = email;
        public string IP { get; set; } = ip;
        public string Language { get; set; } = language;
        public string Jwt { get; set; } = jwt;
    }
}
