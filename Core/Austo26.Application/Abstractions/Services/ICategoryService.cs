using Austo26.Domain.Categories;

namespace Austo26.Application.Abstractions.Services;

public interface ICategoryService
{
    Task<IEnumerable<Category>> GetAllAsync();
    Task<Category> CreateAsync(string name, string? description);
    Task<Category> UpdateAsync(Guid id, string name, string? description);
    Task DeactivateAsync(Guid id);
}
