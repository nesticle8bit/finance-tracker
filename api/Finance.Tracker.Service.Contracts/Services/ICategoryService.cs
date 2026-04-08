using Finance.Tracker.Shared.DataTransferObjects.Finance;

namespace Finance.Tracker.Service.Contracts.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryResponseDto>> GetCategories();
        Task<CategoryResponseDto> CreateCategory(CategoryCreateDto dto);
        Task<CategoryResponseDto> UpdateCategory(Guid id, CategoryUpdateDto dto);
        Task DeleteCategory(Guid id);
    }
}
