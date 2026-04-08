using Finance.Tracker.Presentation.Helpers;
using Finance.Tracker.Service.Contracts.Manager;
using Finance.Tracker.Shared.DataTransferObjects.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finance.Tracker.Presentation.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController(IServiceManager serviceManager) : ControllerBase
    {
        private readonly IServiceManager _serviceManager = serviceManager;

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] UserCreateDto user)
        {
            JsonObjectResult<string> result = new();

            try
            {
                result.Data = await _serviceManager.AuthenticationService.RegisterUser(user);
            }
            catch (Exception e)
            {
                result.Errors = [e.Message, e.StackTrace];
                result.Status = 500;

                return StatusCode(500, result);
            }

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginUser([FromBody] LoginUserDto login)
        {
            JsonObjectResult<string> result = new();

            try
            {
                result.Data = await _serviceManager.AuthenticationService.LoginUser(login);
            }
            catch (Exception e)
            {
                result.Errors = [e.Message];
                result.Status = 500;

                return StatusCode(500, result);
            }

            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            JsonObjectResult<UserResponseDto> result = new();

            try
            {
                result.Data = await _serviceManager.AuthenticationService.GetCurrentUser();
            }
            catch (Exception e)
            {
                result.Errors = [e.Message];
                result.Status = 500;

                return StatusCode(500, result);
            }

            return Ok(result);
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            JsonObjectResult<UserResponseDto> result = new();

            try
            {
                result.Data = await _serviceManager.AuthenticationService.UpdateProfile(dto);
            }
            catch (Exception e)
            {
                result.Errors = [e.Message];
                result.Status = 500;

                return StatusCode(500, result);
            }

            return Ok(result);
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            JsonObjectResult<string> result = new();

            try
            {
                await _serviceManager.AuthenticationService.ChangePassword(dto);
                result.Data = "Password changed successfully.";
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
