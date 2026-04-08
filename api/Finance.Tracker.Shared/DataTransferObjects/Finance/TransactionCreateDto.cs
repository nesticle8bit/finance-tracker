namespace Finance.Tracker.Shared.DataTransferObjects.Finance
{
    public class TransactionCreateDto
    {
        public required Guid CategoryId { get; set; }
        public required string Desc { get; set; }
        public required decimal Amount { get; set; }
        public required string Type { get; set; }
        public required DateTime Date { get; set; }
    }
}
