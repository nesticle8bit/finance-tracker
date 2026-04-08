using Finance.Tracker.Presentation.Helpers;
using Finance.Tracker.Service.Contracts.Manager;
using Finance.Tracker.Shared.DataTransferObjects.Admin;
using Finance.Tracker.Shared.DataTransferObjects.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finance.Tracker.Presentation.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Policy = "AdminOnly")]
    public class AdminController(IServiceManager serviceManager) : ControllerBase
    {
        private readonly IServiceManager _serviceManager = serviceManager;

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var result = new JsonObjectResult<IEnumerable<UserResponseDto>>();
            try { result.Data = await _serviceManager.AdminService.GetAllUsers(); }
            catch (Exception e) { result.Errors = [e.Message]; result.Status = 500; return StatusCode(500, result); }
            return Ok(result);
        }

        [HttpGet("users/{id:guid}")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            var result = new JsonObjectResult<UserResponseDto>();
            try { result.Data = await _serviceManager.AdminService.GetUser(id); }
            catch (Exception e) { result.Errors = [e.Message]; result.Status = 500; return StatusCode(500, result); }
            return Ok(result);
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] AdminCreateUserDto dto)
        {
            var result = new JsonObjectResult<UserResponseDto>();
            try { result.Data = await _serviceManager.AdminService.CreateUser(dto); }
            catch (Exception e) { result.Errors = [e.Message]; result.Status = 500; return StatusCode(500, result); }
            return Ok(result);
        }

        [HttpPut("users/{id:guid}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] AdminUpdateUserDto dto)
        {
            var result = new JsonObjectResult<UserResponseDto>();
            try { result.Data = await _serviceManager.AdminService.UpdateUser(id, dto); }
            catch (Exception e) { result.Errors = [e.Message]; result.Status = 500; return StatusCode(500, result); }
            return Ok(result);
        }

        [HttpDelete("users/{id:guid}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var result = new JsonObjectResult<object>();
            try { await _serviceManager.AdminService.DeleteUser(id); result.Data = new { }; }
            catch (Exception e) { result.Errors = [e.Message]; result.Status = 500; return StatusCode(500, result); }
            return Ok(result);
        }
    }
}
