using Austo26.Domain.Stock;

namespace Austo26.Application.Repositories;

public interface IStockItemRepository : IBaseRepository<StockItem>
{
    Task<StockItem?> GetByIdWithDetailsAsync(Guid id);
    Task<StockItem?> GetByCodeAsync(string itemCode);
    Task<IEnumerable<StockItem>> GetByProductAsync(Guid productId);
    Task<IEnumerable<StockItem>> GetFilteredAsync(Guid? productId, StockItemStatus? status, Guid? locationId);
    Task<int> GetLastSequenceAsync(); // AUSTO-XXXXX için son sıra no
}
