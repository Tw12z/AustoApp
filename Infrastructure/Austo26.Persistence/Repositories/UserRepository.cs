using Austo26.Application.Repositories;
using Austo26.Domain.Users;
using Austo26.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Austo26.Persistence.Repositories;

public class UserRepository : BaseRepository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context, context.Users) { }

    public async Task<bool> IsUserExistsAsync(string userName, string email)
        => await _dbSet.AnyAsync(u => u.UserName == userName || u.Email == email);

    public async Task<User?> GetByUserNameOrEmailAsync(string identifier)
        => await _dbSet.FirstOrDefaultAsync(u => u.UserName == identifier || u.Email == identifier);

    public async Task<User?> GetByEmailAsync(string email)
        => await _dbSet.FirstOrDefaultAsync(u => u.Email == email);

    public async Task<User?> GetByEmailVerificationTokenAsync(string token)
        => await _dbSet.FirstOrDefaultAsync(u => u.EmailVerificationToken == token);

    public async Task<User?> GetByPasswordResetTokenAsync(string token)
        => await _dbSet.FirstOrDefaultAsync(u => u.PasswordResetToken == token);
}
