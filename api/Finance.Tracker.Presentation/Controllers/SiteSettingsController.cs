using Finance.Tracker.Presentation.Helpers;
using Finance.Tracker.Service.Contracts.Manager;
using Finance.Tracker.Shared.DataTransferObjects.SiteSettings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finance.Tracker.Presentation.Controllers
{
    [ApiController]
    [Route("api/site-settings")]
    public class SiteSettingsController(IServiceManager serviceManager) : ControllerBase
    {
        private readonly IServiceManager _serviceManager = serviceManager;

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var result = new JsonObjectResult<SiteSettingsDto>();
            try { result.Data = await _serviceManager.SiteSettingsService.GetSettings(); }
            catch (Exception e) { result.Errors = [e.Message]; result.Status = 500; return StatusCode(500, result); }
            return Ok(result);
        }

        [HttpPut]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update([FromBody] SiteSettingsDto dto)
        {
            var result = new JsonObjectResult<SiteSettingsDto>();
            try { result.Data = await _serviceManager.SiteSettingsService.UpdateSettings(dto); }
            catch (Exception e) { result.Errors = [e.Message]; result.Status = 500; return StatusCode(500, result); }
            return Ok(result);
        }
    }
}
