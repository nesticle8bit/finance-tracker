using Finance.Tracker.Contracts.Manager;
using Finance.Tracker.Entities.Finance;
using Finance.Tracker.Service.Contracts.Services;
using Finance.Tracker.Shared.DataTransferObjects.Finance;
using Finance.Tracker.Shared.Transversal;

namespace Finance.Tracker.Service.Services
{
    public class TransactionService(IRepositoryManager repository, IAppPrincipal appPrincipal) : ITransactionService
    {
        private readonly IRepositoryManager _repository = repository;
        private readonly IAppPrincipal _appPrincipal = appPrincipal;

        private Guid UserId => Guid.Parse(_appPrincipal.Id);

        public async Task<IEnumerable<TransactionResponseDto>> GetTransactions(string? month)
        {
            var query = _repository.TransactionRepository.FindByUser(UserId, false);

            if (!string.IsNullOrEmpty(month) && DateOnly.TryParseExact(month + "-01", "yyyy-MM-dd", out var parsed))
                query = query.Where(t => t.Date.Year == parsed.Year && t.Date.Month == parsed.Month);

            var transactions = query.ToList();

            return transactions.Select(t => new TransactionResponseDto
            {
                Id = t.Id,
                CategoryId = t.CategoryId,
                CategoryName = t.Category.Name,
                CategoryIcon = t.Category.Icon,
                CategoryColor = t.Category.Color,
                Desc = t.Desc,
                Amount = t.Amount,
                Type = t.Type,
                Date = t.Date,
                CreatedAt = t.CreatedAt
            });
        }

        public async Task<TransactionResponseDto> CreateTransaction(TransactionCreateDto dto)
        {
            var entity = new Transaction
            {
                UserId = UserId,
                CategoryId = dto.CategoryId,
                Desc = dto.Desc,
                Amount = dto.Amount,
                Type = dto.Type,
                Date = dto.Date
            };

            _repository.TransactionRepository.Create(entity);
            _repository.Save();

            var saved = await _repository.TransactionRepository.FindById(entity.Id, UserId, false)
                ?? throw new Exception("Transaction not found after creation.");

            return MapToDto(saved);
        }

        public async Task<TransactionResponseDto> UpdateTransaction(Guid id, TransactionUpdateDto dto)
        {
            var entity = await _repository.TransactionRepository.FindById(id, UserId, true)
                ?? throw new Exception("Transaction not found.");

            entity.CategoryId = dto.CategoryId;
            entity.Desc = dto.Desc;
            entity.Amount = dto.Amount;
            entity.Type = dto.Type;
            entity.Date = dto.Date;

            _repository.TransactionRepository.Update(entity);
            _repository.Save();

            var updated = await _repository.TransactionRepository.FindById(id, UserId, false)
                ?? throw new Exception("Transaction not found after update.");

            return MapToDto(updated);
        }

        public async Task DeleteTransaction(Guid id)
        {
            var entity = await _repository.TransactionRepository.FindById(id, UserId, false)
                ?? throw new Exception("Transaction not found.");

            _repository.TransactionRepository.Delete(entity);
            _repository.Save();
        }

        private static TransactionResponseDto MapToDto(Transaction t) => new()
        {
            Id = t.Id,
            CategoryId = t.CategoryId,
            CategoryName = t.Category.Name,
            CategoryIcon = t.Category.Icon,
            CategoryColor = t.Category.Color,
            Desc = t.Desc,
            Amount = t.Amount,
            Type = t.Type,
            Date = t.Date,
            CreatedAt = t.CreatedAt
        };
    }
}
