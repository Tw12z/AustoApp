using Austo26.Domain.Stock;

namespace Austo26.Application.Repositories;

public interface IStockMovementRepository : IBaseRepository<StockMovement>
{
    Task<IEnumerable<StockMovement>> GetByProductAsync(Guid productId);
    Task<IEnumerable<StockMovement>> GetByLocationAsync(Guid locationId);
}
