using Finance.Tracker.Shared.DataTransferObjects.Authentication;

namespace Finance.Tracker.Service.Contracts.Services
{
    public interface IAuthenticationService
    {
        Task<string> RegisterUser(UserCreateDto user);

        Task<string> LoginUser(LoginUserDto login);

        Task<UserResponseDto> GetCurrentUser();

        Task ChangePassword(ChangePasswordDto dto);

        Task<UserResponseDto> UpdateProfile(UpdateProfileDto dto);
    }
}
