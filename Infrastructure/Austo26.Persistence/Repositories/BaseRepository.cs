using Austo26.Application.Repositories;
using Austo26.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Austo26.Persistence.Repositories;

public abstract class BaseRepository<T> : IBaseRepository<T> where T : class
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _dbSet;

    protected BaseRepository(AppDbContext context, DbSet<T> dbSet)
    {
        _context = context;
        _dbSet   = dbSet;
    }

    public async Task<EntityEntry<T>> AddAsync(T entity) => await _dbSet.AddAsync(entity);
    public void AddRange(IEnumerable<T> entities) => _dbSet.AddRange(entities);
    public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();
    public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();
}
