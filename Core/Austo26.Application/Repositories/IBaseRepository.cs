using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Austo26.Application.Repositories;

public interface IBaseRepository<T> where T : class
{
    Task<EntityEntry<T>> AddAsync(T entity);
    void AddRange(IEnumerable<T> entities);
    Task<IEnumerable<T>> GetAllAsync();
    Task<int> SaveChangesAsync();
}
