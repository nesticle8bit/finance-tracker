using Finance.Tracker.Service.Contracts.Manager;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Finance.Tracker.Presentation.Controllers
{
    [ApiController]
    [Route("api/export")]
    [Authorize]
    public class ExportController(IServiceManager serviceManager) : ControllerBase
    {
        private readonly IServiceManager _serviceManager = serviceManager;

        [HttpGet("json")]
        public async Task<IActionResult> ExportJson()
        {
            try
            {
                var data = await _serviceManager.ExportService.ExportUserData();

                var json = JsonSerializer.Serialize(data, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var bytes = System.Text.Encoding.UTF8.GetBytes(json);

                return File(bytes, "application/json", "finance-export.json");
            }
            catch (Exception e)
            {
                return StatusCode(500, new { errors = new[] { e.Message } });
            }
        }

        [HttpGet("csv")]
        public async Task<IActionResult> ExportCsv()
        {
            try
            {
                var csv = await _serviceManager.ExportService.BuildCsvExport();
                var bytes = System.Text.Encoding.UTF8.GetBytes(csv);

                return File(bytes, "text/csv", "finance-export.csv");
            }
            catch (Exception e)
            {
                return StatusCode(500, new { errors = new[] { e.Message } });
            }
        }
    }
}
