using Finance.Tracker.Contracts.Manager;
using Finance.Tracker.Entities.Parameters;
using Finance.Tracker.Service.Contracts.Services;
using Finance.Tracker.Shared.DataTransferObjects.Finance;
using Finance.Tracker.Shared.Transversal;

namespace Finance.Tracker.Service.Services
{
    public class CategoryService(IRepositoryManager repository, IAppPrincipal appPrincipal) : ICategoryService
    {
        private readonly IRepositoryManager _repository = repository;
        private readonly IAppPrincipal _appPrincipal = appPrincipal;

        private Guid UserId => Guid.Parse(_appPrincipal.Id);

        public async Task<IEnumerable<CategoryResponseDto>> GetCategories()
        {
            var categories = _repository.CategoryRepository.FindByUser(UserId, false).ToList();

            return categories.Select(MapToDto);
        }

        public async Task<CategoryResponseDto> CreateCategory(CategoryCreateDto dto)
        {
            var entity = new Category
            {
                UserId = UserId,
                Name = dto.Name,
                Icon = dto.Icon,
                Color = dto.Color,
                Type = dto.Type,
                IsDefault = false
            };

            _repository.CategoryRepository.Create(entity);
            _repository.Save();

            return MapToDto(entity);
        }

        public async Task<CategoryResponseDto> UpdateCategory(Guid id, CategoryUpdateDto dto)
        {
            var entity = await _repository.CategoryRepository.FindById(id, UserId, true)
                ?? throw new Exception("Category not found.");

            entity.Name = dto.Name;
            entity.Icon = dto.Icon;
            entity.Color = dto.Color;
            entity.Type = dto.Type;

            _repository.CategoryRepository.Update(entity);
            _repository.Save();

            return MapToDto(entity);
        }

        public async Task DeleteCategory(Guid id)
        {
            var entity = await _repository.CategoryRepository.FindById(id, UserId, false)
                ?? throw new Exception("Category not found.");

            if (entity.IsDefault)
                throw new Exception("Default categories cannot be deleted.");

            _repository.CategoryRepository.Delete(entity);
            _repository.Save();
        }

        private static CategoryResponseDto MapToDto(Category c) => new()
        {
            Id = c.Id,
            Name = c.Name,
            Icon = c.Icon,
            Color = c.Color,
            Type = c.Type,
            IsDefault = c.IsDefault
        };
    }
}
