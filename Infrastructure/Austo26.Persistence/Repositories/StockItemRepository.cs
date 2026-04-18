using Austo26.Application.Repositories;
using Austo26.Domain.Stock;
using Austo26.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Austo26.Persistence.Repositories;

public class StockItemRepository : BaseRepository<StockItem>, IStockItemRepository
{
    public StockItemRepository(AppDbContext context) : base(context, context.StockItems) { }

    public async Task<StockItem?> GetByIdWithDetailsAsync(Guid id)
        => await _dbSet
            .Include(s => s.Product).ThenInclude(p => p.Category)
            .Include(s => s.Location)
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<StockItem?> GetByCodeAsync(string itemCode)
        => await _dbSet
            .Include(s => s.Product).ThenInclude(p => p.Category)
            .Include(s => s.Location)
            .FirstOrDefaultAsync(s => s.ItemCode == itemCode);

    public async Task<IEnumerable<StockItem>> GetByProductAsync(Guid productId)
        => await _dbSet
            .Include(s => s.Product).ThenInclude(p => p.Category)
            .Include(s => s.Location)
            .Where(s => s.ProductId == productId)
            .OrderBy(s => s.ItemCode)
            .ToListAsync();

    public async Task<IEnumerable<StockItem>> GetFilteredAsync(Guid? productId, StockItemStatus? status, Guid? locationId)
    {
        var query = _dbSet
            .Include(s => s.Product).ThenInclude(p => p.Category)
            .Include(s => s.Location)
            .AsQueryable();

        if (productId.HasValue)  query = query.Where(s => s.ProductId == productId.Value);
        if (status.HasValue)     query = query.Where(s => s.Status == status.Value);
        if (locationId.HasValue) query = query.Where(s => s.LocationId == locationId.Value);

        return await query.OrderBy(s => s.ItemCode).ToListAsync();
    }

    public async Task<int> GetLastSequenceAsync()
    {
        // "AUSTO-00042" formatından sayıyı çıkar
        var last = await _dbSet
            .Where(s => s.ItemCode.StartsWith("AUSTO-"))
            .OrderByDescending(s => s.ItemCode)
            .Select(s => s.ItemCode)
            .FirstOrDefaultAsync();

        if (last is null) return 0;

        // "AUSTO-00042" → "00042" → 42
        var numPart = last[6..]; // "AUSTO-" = 6 chars
        return int.TryParse(numPart, out var n) ? n : 0;
    }
}
