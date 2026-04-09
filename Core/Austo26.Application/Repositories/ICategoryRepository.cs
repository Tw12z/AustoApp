using Austo26.Domain.Categories;

namespace Austo26.Application.Repositories;

public interface ICategoryRepository : IBaseRepository<Category>
{
    Task<Category?> GetByIdAsync(Guid id);
}
