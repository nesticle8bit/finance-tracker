using Finance.Tracker.Presentation.Helpers;
using Finance.Tracker.Service.Contracts.Manager;
using Finance.Tracker.Shared.DataTransferObjects.Finance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finance.Tracker.Presentation.Controllers
{
    [ApiController]
    [Route("api/categories")]
    [Authorize]
    public class CategoryController(IServiceManager serviceManager) : ControllerBase
    {
        private readonly IServiceManager _serviceManager = serviceManager;

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            JsonObjectResult<IEnumerable<CategoryResponseDto>> result = new();

            try
            {
                result.Data = await _serviceManager.CategoryService.GetCategories();
            }
            catch (Exception e)
            {
                result.Errors = [e.Message];
                result.Status = 500;

                return StatusCode(500, result);
            }

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryCreateDto dto)
        {
            JsonObjectResult<CategoryResponseDto> result = new();

            try
            {
                result.Data = await _serviceManager.CategoryService.CreateCategory(dto);
            }
            catch (Exception e)
            {
                result.Errors = [e.Message];
                result.Status = 500;

                return StatusCode(500, result);
            }

            return Ok(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CategoryUpdateDto dto)
        {
            JsonObjectResult<CategoryResponseDto> result = new();

            try
            {
                result.Data = await _serviceManager.CategoryService.UpdateCategory(id, dto);
            }
            catch (Exception e)
            {
                result.Errors = [e.Message];
                result.Status = 500;

                return StatusCode(500, result);
            }

            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            JsonObjectResult<object> result = new();

            try
            {
                await _serviceManager.CategoryService.DeleteCategory(id);
            }
            catch (Exception e)
            {
                result.Errors = [e.Message];
                result.Status = 500;

                return StatusCode(500, result);
            }

            return Ok(result);
        }
    }
}
