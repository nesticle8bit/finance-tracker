using Finance.Tracker.Entities.Authentication;
using Finance.Tracker.Shared.DataTransferObjects.Authentication;

namespace Finance.Tracker.Contracts.Interfaces
{
    public interface IUserRepository
    {
        Task<IQueryable<User>> FindUsers(UserSearchDto? search, bool trackChanges);

        Task CreateUser(User user);

        Task AssignDefaultCategories(Guid userId);

        Task UpdateUser(User user);
    }
}
