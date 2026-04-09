using Austo26.Domain.Users;

namespace Austo26.Application.Repositories;

public interface IUserRepository : IBaseRepository<User>
{
    Task<bool> IsUserExistsAsync(string userName, string email);
    Task<User?> GetByUserNameOrEmailAsync(string identifier);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByEmailVerificationTokenAsync(string token);
    Task<User?> GetByPasswordResetTokenAsync(string token);
}
