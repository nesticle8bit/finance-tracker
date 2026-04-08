using Finance.Tracker.Contracts.Manager;
using Finance.Tracker.Entities.Authentication;
using Finance.Tracker.Service.Contracts.Services;
using Finance.Tracker.Shared.DataTransferObjects.Authentication;
using Finance.Tracker.Shared.Helpers;
using Finance.Tracker.Shared.Transversal;

namespace Finance.Tracker.Service.Services
{
    public class AuthenticationService(IRepositoryManager repository, IAppPrincipal appPrincipal) : IAuthenticationService
    {
        private readonly IRepositoryManager _repository = repository;
        private readonly IAppPrincipal _appPrincipal = appPrincipal;

        public async Task<string> RegisterUser(UserCreateDto user)
        {
            var userExists = await _repository.UserRepository.FindUsers(new UserSearchDto { Email = user.Email }, false);

            if (userExists.FirstOrDefault() != null)
                throw new Exception("User with the same email already exists.");

            user.Email = user.Email.Trim().ToLower();

            User newUser = new()
            {
                Id = Guid.NewGuid(),
                Name = user.Name,
                Email = user.Email,
                PasswordHash = BCryptHelper.HashPassword(user.Password),
            };

            await _repository.UserRepository.CreateUser(newUser);
            _repository.Save();

            await _repository.UserRepository.AssignDefaultCategories(newUser.Id);

            var token = JwtHelper.Generate(new UserUpdateDto
            {
                Email = newUser.Email,
                Id = newUser.Id.ToString(),
                Name = newUser.Name,
                Password = newUser.PasswordHash,
                Role = newUser.Role
            });

            return token;
        }

        public async Task<string> LoginUser(LoginUserDto login)
        {
            var user = await _repository.UserRepository.FindUsers(new UserSearchDto { Email = login.Email }, false);
            var entity = user.FirstOrDefault()
                ?? throw new Exception("El usuario con el correo electrónico no existe en el sistema.");

            var userEntity = user.FirstOrDefault();

            if (!BCryptHelper.Verify(login.Password, userEntity.PasswordHash))
                throw new Exception("La contraseña ingresada es incorrecta.");

            userEntity.LastSeenAt = DateTime.UtcNow;
            await _repository.UserRepository.UpdateUser(userEntity);
            _repository.Save();

            var token = JwtHelper.Generate(new UserUpdateDto
            {
                Id = userEntity.Id.ToString(),
                Email = userEntity.Email,
                Name = userEntity.Name,
                Password = userEntity.PasswordHash,
                Role = userEntity.Role
            });

            return token;
        }

        public async Task<UserResponseDto> GetCurrentUser()
        {
            var users = await _repository.UserRepository.FindUsers(new UserSearchDto { UserId = _appPrincipal.Id }, false);
            var user = users.FirstOrDefault() ?? throw new Exception("User not found.");

            return new UserResponseDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                Name = user.Name,
                CreatedAt = user.CreatedAt,
                Role = user.Role,
                LastSeenAt = user.LastSeenAt
            };
        }

        public async Task ChangePassword(ChangePasswordDto dto)
        {
            var users = await _repository.UserRepository.FindUsers(new UserSearchDto { UserId = _appPrincipal.Id }, true);
            var user = users.FirstOrDefault() ?? throw new Exception("User not found.");

            if (!BCryptHelper.Verify(dto.CurrentPassword, user.PasswordHash))
                throw new Exception("The current password is incorrect.");

            user.PasswordHash = BCryptHelper.HashPassword(dto.NewPassword);

            await _repository.UserRepository.UpdateUser(user);
            _repository.Save();
        }

        public async Task<UserResponseDto> UpdateProfile(UpdateProfileDto dto)
        {
            var normalizedEmail = dto.Email.Trim().ToLower();

            var emailTaken = await _repository.UserRepository.FindUsers(new UserSearchDto { Email = normalizedEmail }, false);
            if (emailTaken.Any(u => u.Id.ToString() != _appPrincipal.Id))
                throw new Exception("Email is already in use by another account.");

            var users = await _repository.UserRepository.FindUsers(new UserSearchDto { UserId = _appPrincipal.Id }, true);
            var user = users.FirstOrDefault() ?? throw new Exception("User not found.");

            user.Name = dto.Name.Trim();
            user.Email = normalizedEmail;

            await _repository.UserRepository.UpdateUser(user);
            _repository.Save();

            return new UserResponseDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                Name = user.Name,
                CreatedAt = user.CreatedAt,
                Role = user.Role,
                LastSeenAt = user.LastSeenAt
            };
        }
    }
}
