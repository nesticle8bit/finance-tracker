namespace Finance.Tracker.Shared.Transversal
{
    public interface IAppPrincipal
    {
        string Id { get; set; }
        string UserName { get; set; }
        string Email { get; set; }
        string Language { get; set; }
        string IP { get; set; }
        string Jwt { get; set; }
    }
}
