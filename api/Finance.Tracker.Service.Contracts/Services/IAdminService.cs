using Finance.Tracker.Shared.DataTransferObjects.Admin;
using Finance.Tracker.Shared.DataTransferObjects.Authentication;

namespace Finance.Tracker.Service.Contracts.Services
{
    public interface IAdminService
    {
        Task<IEnumerable<UserResponseDto>> GetAllUsers();
        Task<UserResponseDto> GetUser(Guid id);
        Task<UserResponseDto> CreateUser(AdminCreateUserDto dto);
        Task<UserResponseDto> UpdateUser(Guid id, AdminUpdateUserDto dto);
        Task DeleteUser(Guid id);
    }
}
