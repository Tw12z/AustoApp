using Austo26.Application.Repositories;
using Austo26.Domain.Categories;
using Austo26.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Austo26.Persistence.Repositories;

public class CategoryRepository : BaseRepository<Category>, ICategoryRepository
{
    public CategoryRepository(AppDbContext context) : base(context, context.Categories) { }

    public async Task<Category?> GetByIdAsync(Guid id) => await _dbSet.FindAsync(id);
}
