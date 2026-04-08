using Finance.Tracker.Presentation.Helpers;
using Finance.Tracker.Service.Contracts.Manager;
using Finance.Tracker.Shared.DataTransferObjects.Finance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finance.Tracker.Presentation.Controllers
{
    [ApiController]
    [Route("api/budget")]
    [Authorize]
    public class BudgetController(IServiceManager serviceManager) : ControllerBase
    {
        private readonly IServiceManager _serviceManager = serviceManager;

        [HttpGet]
        public async Task<IActionResult> GetBudget()
        {
            JsonObjectResult<BudgetResponseDto> result = new();

            try
            {
                result.Data = await _serviceManager.BudgetService.GetBudget();
            }
            catch (Exception e)
            {
                result.Errors = [e.Message];
                result.Status = 500;

                return StatusCode(500, result);
            }

            return Ok(result);
        }

        [HttpPut]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> UpdateBudget([FromBody] BudgetUpdateDto dto)
        {
            JsonObjectResult<BudgetResponseDto> result = new();

            try
            {
                result.Data = await _serviceManager.BudgetService.UpdateBudget(dto);
            }
            catch (Exception e)
            {
                result.Errors = [e.Message];
                result.Status = 500;

                return StatusCode(500, result);
            }

            return Ok(result);
        }

        [HttpGet("limits")]
        public async Task<IActionResult> GetCategoryLimits()
        {
            JsonObjectResult<IEnumerable<CategoryLimitResponseDto>> result = new();

            try
            {
                result.Data = await _serviceManager.BudgetService.GetCategoryLimits();
            }
            catch (Exception e)
            {
                result.Errors = [e.Message];
                result.Status = 500;

                return StatusCode(500, result);
            }

            return Ok(result);
        }

        [HttpPut("limits/{categoryId:guid}")]
        public async Task<IActionResult> SetCategoryLimit(Guid categoryId, [FromBody] CategoryLimitUpdateDto dto)
        {
            JsonObjectResult<CategoryLimitResponseDto> result = new();

            try
            {
                result.Data = await _serviceManager.BudgetService.SetCategoryLimit(categoryId, dto);
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
