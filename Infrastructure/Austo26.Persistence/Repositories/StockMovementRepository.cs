using Austo26.Application.Repositories;
using Austo26.Domain.Stock;
using Austo26.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Austo26.Persistence.Repositories;

public class StockMovementRepository : BaseRepository<StockMovement>, IStockMovementRepository
{
    public StockMovementRepository(AppDbContext context) : base(context, context.StockMovements) { }

    public async Task<IEnumerable<StockMovement>> GetByProductAsync(Guid productId)
        => await _dbSet.Include(s => s.Product).Include(s => s.Location).Include(s => s.ToLocation)
                       .Where(s => s.ProductId == productId).OrderByDescending(s => s.CreatedAt).ToListAsync();

    public async Task<IEnumerable<StockMovement>> GetByLocationAsync(Guid locationId)
        => await _dbSet.Include(s => s.Product).Include(s => s.Location).Include(s => s.ToLocation)
                       .Where(s => s.LocationId == locationId || s.ToLocationId == locationId)
                       .OrderByDescending(s => s.CreatedAt).ToListAsync();
}
