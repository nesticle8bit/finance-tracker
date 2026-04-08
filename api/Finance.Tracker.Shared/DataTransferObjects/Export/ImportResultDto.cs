namespace Finance.Tracker.Shared.DataTransferObjects.Export
{
    public class ImportResultDto
    {
        public int CategoriesImported { get; set; }
        public int TransactionsImported { get; set; }
        public int CategoryLimitsImported { get; set; }
        public bool BudgetImported { get; set; }
    }
}
