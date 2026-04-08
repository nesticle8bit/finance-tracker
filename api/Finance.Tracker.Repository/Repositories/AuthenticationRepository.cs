using Finance.Tracker.Contracts.Interfaces;
using Finance.Tracker.Entities.Authentication;
using Finance.Tracker.Repository.RepositoryBase;
using Finance.Tracker.Repository.Seed;
using Finance.Tracker.Shared.DataTransferObjects.Authentication;
using Microsoft.EntityFrameworkCore;

namespace Finance.Tracker.Repository.Repositories
{
    public class AuthenticationRepository(RepositoryContext context, SeedService seed) : RepositoryBase<User>(context), IUserRepository
    {
        public async Task<IQueryable<User>> FindUsers(UserSearchDto? search, bool trackChanges)
        {
            var users = FindAll(trackChanges);

            if (search is null)
                return users;

            if (!string.IsNullOrEmpty(search.UserId))
            {
                if (Guid.TryParse(search.UserId, out var userId))
                    users = users.Where(u => u.Id == userId);
            }

            if (!string.IsNullOrEmpty(search.Email))
                users = users.Where(u => u.Email == search.Email.Trim().ToLower());

            return users;
        }

        public async Task<IEnumerable<User>> FindAllUsers(bool trackChanges) =>
            await FindAll(trackChanges).OrderBy(u => u.Name).ToListAsync();

        public async Task<User?> FindUserById(Guid id, bool trackChanges) =>
            await FindByCondition(u => u.Id == id, trackChanges).FirstOrDefaultAsync();

        public async Task AssignDefaultCategories(Guid userId) =>
            await seed.SeedUserCategories(userId);

        public async Task CreateUser(User user) => Create(user);

        public async Task UpdateUser(User user) => Update(user);

        public void DeleteUser(User user) => Delete(user);
    }
}
