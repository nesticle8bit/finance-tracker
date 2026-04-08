using Finance.Tracker.Contracts.Manager;
using Finance.Tracker.Entities.Authentication;
using Finance.Tracker.Service.Contracts.Services;
using Finance.Tracker.Shared.DataTransferObjects.Admin;
using Finance.Tracker.Shared.DataTransferObjects.Authentication;
using Finance.Tracker.Shared.Helpers;

namespace Finance.Tracker.Service.Services
{
    public class AdminService(IRepositoryManager repository) : IAdminService
    {
        private readonly IRepositoryManager _repository = repository;

        public async Task<IEnumerable<UserResponseDto>> GetAllUsers()
        {
            var users = await _repository.UserRepository.FindAllUsers(false);
            return users.Select(MapToDto);
        }

        public async Task<UserResponseDto> GetUser(Guid id)
        {
            var user = await _repository.UserRepository.FindUserById(id, false)
                ?? throw new Exception("Usuario no encontrado.");
            return MapToDto(user);
        }

        public async Task<UserResponseDto> CreateUser(AdminCreateUserDto dto)
        {
            var existing = await _repository.UserRepository.FindUsers(
                new UserSearchDto { Email = dto.Email.Trim().ToLower() }, false);
            if (existing.Any())
                throw new Exception("Ya existe un usuario con ese correo.");

            var user = new User
            {
                Name = dto.Name.Trim(),
                Email = dto.Email.Trim().ToLower(),
                PasswordHash = BCryptHelper.HashPassword(dto.Password),
                Role = dto.Role
            };

            await _repository.UserRepository.CreateUser(user);
            _repository.Save();
            await _repository.UserRepository.AssignDefaultCategories(user.Id);

            return MapToDto(user);
        }

        public async Task<UserResponseDto> UpdateUser(Guid id, AdminUpdateUserDto dto)
        {
            var user = await _repository.UserRepository.FindUserById(id, true)
                ?? throw new Exception("Usuario no encontrado.");

            var normalizedEmail = dto.Email.Trim().ToLower();
            var emailTaken = await _repository.UserRepository.FindUsers(
                new UserSearchDto { Email = normalizedEmail }, false);
            if (emailTaken.Any(u => u.Id != id))
                throw new Exception("El correo ya está en uso por otro usuario.");

            user.Name = dto.Name.Trim();
            user.Email = normalizedEmail;
            user.Role = dto.Role;

            if (!string.IsNullOrWhiteSpace(dto.Password))
                user.PasswordHash = BCryptHelper.HashPassword(dto.Password);

            await _repository.UserRepository.UpdateUser(user);
            _repository.Save();

            return MapToDto(user);
        }

        public async Task DeleteUser(Guid id)
        {
            var user = await _repository.UserRepository.FindUserById(id, false)
                ?? throw new Exception("Usuario no encontrado.");
            _repository.UserRepository.DeleteUser(user);
            _repository.Save();
        }

        private static UserResponseDto MapToDto(User u) => new()
        {
            Id = u.Id.ToString(),
            Email = u.Email,
            Name = u.Name,
            CreatedAt = u.CreatedAt,
            Role = u.Role,
            LastSeenAt = u.LastSeenAt
        };
    }
}
