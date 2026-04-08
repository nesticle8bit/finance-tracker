using Finance.Tracker.Presentation.Helpers;
using Finance.Tracker.Service.Contracts.Manager;
using Finance.Tracker.Shared.DataTransferObjects.Finance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finance.Tracker.Presentation.Controllers
{
    [ApiController]
    [Route("api/transactions")]
    [Authorize]
    public class TransactionController(IServiceManager serviceManager) : ControllerBase
    {
        private readonly IServiceManager _serviceManager = serviceManager;

        [HttpGet]
        public async Task<IActionResult> GetTransactions([FromQuery] string? month)
        {
            JsonObjectResult<IEnumerable<TransactionResponseDto>> result = new();

            try
            {
                result.Data = await _serviceManager.TransactionService.GetTransactions(month);
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
        public async Task<IActionResult> CreateTransaction([FromBody] TransactionCreateDto dto)
        {
            JsonObjectResult<TransactionResponseDto> result = new();

            try
            {
                result.Data = await _serviceManager.TransactionService.CreateTransaction(dto);
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
        public async Task<IActionResult> UpdateTransaction(Guid id, [FromBody] TransactionUpdateDto dto)
        {
            JsonObjectResult<TransactionResponseDto> result = new();

            try
            {
                result.Data = await _serviceManager.TransactionService.UpdateTransaction(id, dto);
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
        public async Task<IActionResult> DeleteTransaction(Guid id)
        {
            JsonObjectResult<object> result = new();

            try
            {
                await _serviceManager.TransactionService.DeleteTransaction(id);
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
