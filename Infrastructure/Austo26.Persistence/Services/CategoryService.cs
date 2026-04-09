using Austo26.Application.Abstractions.Services;
using Austo26.Application.Repositories;
using Austo26.Domain.Categories;

namespace Austo26.Persistence.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repo;

    public CategoryService(ICategoryRepository repo) { _repo = repo; }

    public async Task<IEnumerable<Category>> GetAllAsync() => await _repo.GetAllAsync();

    public async Task<Category> CreateAsync(string name, string? description)
    {
        var category = new Category(name, description);
        await _repo.AddAsync(category);
        await _repo.SaveChangesAsync();
        return category;
    }

    public async Task<Category> UpdateAsync(Guid id, string name, string? description)
    {
        var category = await _repo.GetByIdAsync(id) ?? throw new Exception("Kategori bulunamadı.");
        category.Rename(name);
        category.ChangeDescription(description);
        await _repo.SaveChangesAsync();
        return category;
    }

    public async Task DeactivateAsync(Guid id)
    {
        var category = await _repo.GetByIdAsync(id) ?? throw new Exception("Kategori bulunamadı.");
        category.Deactivate();
        await _repo.SaveChangesAsync();
    }
}
