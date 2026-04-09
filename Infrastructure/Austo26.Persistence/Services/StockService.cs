using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Stock;
using Austo26.Application.Repositories;
using Austo26.Domain.Stock;

namespace Austo26.Persistence.Services;

public class StockService : IStockService
{
    private readonly IStockMovementRepository _stockRepo;
    private readonly IProductRepository _productRepo;
    private readonly ILocationRepository _locationRepo;

    public StockService(IStockMovementRepository stockRepo,
                        IProductRepository productRepo,
                        ILocationRepository locationRepo)
    {
        _stockRepo   = stockRepo;
        _productRepo = productRepo;
        _locationRepo = locationRepo;
    }

    public async Task<IEnumerable<StockMovementDto>> GetMovementsAsync(Guid? productId = null, Guid? locationId = null)
    {
        IEnumerable<StockMovement> movements;

        if (productId.HasValue)
            movements = await _stockRepo.GetByProductAsync(productId.Value);
        else if (locationId.HasValue)
            movements = await _stockRepo.GetByLocationAsync(locationId.Value);
        else
            movements = await _stockRepo.GetAllAsync();

        return movements.Select(m => new StockMovementDto(
            m.Id,
            m.Product?.Name ?? "",
            m.Location?.Name,
            m.ToLocation?.Name,
            m.Quantity,
            m.Type,
            m.Description,
            m.CreatedAt));
    }

    public async Task TransferAsync(StockTransferRequest request)
    {
        var product = await _productRepo.GetByIdAsync(request.ProductId)
                      ?? throw new Exception("Ürün bulunamadı.");

        var fromLocation = await _locationRepo.GetByIdAsync(request.FromLocationId)
                           ?? throw new Exception("Kaynak konum bulunamadı.");

        var toLocation = await _locationRepo.GetByIdAsync(request.ToLocationId)
                         ?? throw new Exception("Hedef konum bulunamadı.");

        var movement = new StockMovement(
            product.Id, request.Quantity, StockMovementType.Transfer,
            request.FromLocationId, request.ToLocationId,
            request.Notes ?? $"{fromLocation.Name} → {toLocation.Name}");

        await _stockRepo.AddAsync(movement);
        await _stockRepo.SaveChangesAsync();
    }

    public async Task<StockValuationDto> GetValuationAsync()
    {
        var products = await _productRepo.GetAllAsync();

        var byPurity = products
            .Where(p => p.IsActive && p.StockQuantity > 0)
            .GroupBy(p => p.Purity)
            .Select(g => new StockValuationItemDto(
                g.Key,
                g.Sum(p => p.WeightGram * p.StockQuantity),
                g.Sum(p => p.StockQuantity),
                g.Sum(p => p.SalePrice * p.StockQuantity)))
            .ToList();

        return new StockValuationDto(
            DateTime.UtcNow,
            byPurity.Sum(b => b.TotalWeightGram),
            byPurity.Sum(b => b.EstimatedValueTRY),
            byPurity);
    }
}
