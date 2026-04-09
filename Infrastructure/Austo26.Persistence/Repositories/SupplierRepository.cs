using Austo26.Application.Repositories;
using Austo26.Domain.Suppliers;
using Austo26.Persistence.Contexts;

namespace Austo26.Persistence.Repositories;

public class SupplierRepository : BaseRepository<Supplier>, ISupplierRepository
{
    public SupplierRepository(AppDbContext context) : base(context, context.Suppliers) { }

    public async Task<Supplier?> GetByIdAsync(Guid id) => await _dbSet.FindAsync(id);
}
