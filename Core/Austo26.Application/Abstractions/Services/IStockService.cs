using Austo26.Application.DTOs.Stock;

namespace Austo26.Application.Abstractions.Services;

public interface IStockService
{
    Task<IEnumerable<StockMovementDto>> GetMovementsAsync(Guid? productId = null, Guid? locationId = null);
    Task TransferAsync(StockTransferRequest request);
    Task AdjustAsync(StockAdjustRequest request);
    Task<StockValuationDto> GetValuationAsync();

    // Konum bazlı görünüm — hangi üründen hangi konumda kaç adet var.
    Task<IEnumerable<LocationStockSummaryDto>> GetLocationSummariesAsync();
    Task<LocationStockDetailDto> GetLocationStockAsync(Guid? locationId);
    Task<IEnumerable<ProductLocationBreakdownDto>> GetProductBreakdownsAsync();
    Task<ProductLocationBreakdownDto> GetProductLocationBreakdownAsync(Guid productId);
}
