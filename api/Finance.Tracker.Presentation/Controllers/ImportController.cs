using Finance.Tracker.Presentation.Helpers;
using Finance.Tracker.Service.Contracts.Manager;
using Finance.Tracker.Shared.DataTransferObjects.Export;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finance.Tracker.Presentation.Controllers
{
    [ApiController]
    [Route("api/import")]
    [Authorize]
    public class ImportController(IServiceManager serviceManager) : ControllerBase
    {
        private readonly IServiceManager _serviceManager = serviceManager;

        [HttpPost]
        public async Task<IActionResult> Import([FromBody] UserExportDto dto)
        {
            JsonObjectResult<ImportResultDto> result = new();

            try
            {
                result.Data = await _serviceManager.ImportService.ImportUserData(dto);
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
