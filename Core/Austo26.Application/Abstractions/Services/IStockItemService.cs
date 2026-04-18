using Austo26.Application.DTOs.Stock;
using Austo26.Domain.Stock;

namespace Austo26.Application.Abstractions.Services;

public interface IStockItemService
{
    Task<StockItemDto?> GetByIdAsync(Guid id);
    Task<StockItemDto?> GetByCodeAsync(string itemCode);
    Task<IEnumerable<StockItemDto>> GetByProductAsync(Guid productId);
    Task<IEnumerable<StockItemDto>> GetFilteredAsync(Guid? productId, StockItemStatus? status, Guid? locationId);
    Task<IEnumerable<StockItemDto>> CreateBatchAsync(CreateStockItemBatchRequest request);
    Task TransferAsync(Guid itemId, StockItemTransferRequest request);
    Task MarkDamagedAsync(Guid itemId, StockItemDamageRequest request);
    Task<byte[]> GetQRAsync(Guid itemId);
}
