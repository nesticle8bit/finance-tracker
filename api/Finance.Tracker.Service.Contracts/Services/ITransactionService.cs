using Finance.Tracker.Shared.DataTransferObjects.Finance;

namespace Finance.Tracker.Service.Contracts.Services
{
    public interface ITransactionService
    {
        Task<IEnumerable<TransactionResponseDto>> GetTransactions(string? month);
        Task<TransactionResponseDto> CreateTransaction(TransactionCreateDto dto);
        Task<TransactionResponseDto> UpdateTransaction(Guid id, TransactionUpdateDto dto);
        Task DeleteTransaction(Guid id);
    }
}
