using Finance.Tracker.Entities.Authentication;
using Finance.Tracker.Shared.DataTransferObjects.Authentication;

namespace Finance.Tracker.Contracts.Interfaces
{
    public interface IUserRepository
    {
        Task<IQueryable<User>> FindUsers(UserSearchDto? search, bool trackChanges);
        Task<IEnumerable<User>> FindAllUsers(bool trackChanges);
        Task<User?> FindUserById(Guid id, bool trackChanges);

        Task CreateUser(User user);
        Task UpdateUser(User user);
        void DeleteUser(User user);

        Task AssignDefaultCategories(Guid userId);
    }
}
