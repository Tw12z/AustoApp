using Austo26.Application.Repositories;
using Austo26.Domain.Stock;
using Austo26.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Austo26.Persistence.Repositories;

public class StockMovementRepository : BaseRepository<StockMovement>, IStockMovementRepository
{
    public StockMovementRepository(AppDbContext context) : base(context, context.StockMovements) { }

    // The unfiltered listing (Stock page with no product/location picked)
    // was falling through to the base's plain ToListAsync() with no
    // .Include()s, so Product/Location always came back null there — same
    // navigation properties the filtered queries below already load
    // correctly.
    public override async Task<IEnumerable<StockMovement>> GetAllAsync()
        => await _dbSet.Include(s => s.Product).Include(s => s.Location).Include(s => s.ToLocation)
                       .OrderByDescending(s => s.CreatedAt).ToListAsync();

    public async Task<IEnumerable<StockMovement>> GetByProductAsync(Guid productId)
        => await _dbSet.Include(s => s.Product).Include(s => s.Location).Include(s => s.ToLocation)
                       .Where(s => s.ProductId == productId).OrderByDescending(s => s.CreatedAt).ToListAsync();

    public async Task<IEnumerable<StockMovement>> GetByLocationAsync(Guid locationId)
        => await _dbSet.Include(s => s.Product).Include(s => s.Location).Include(s => s.ToLocation)
                       .Where(s => s.LocationId == locationId || s.ToLocationId == locationId)
                       .OrderByDescending(s => s.CreatedAt).ToListAsync();
}
