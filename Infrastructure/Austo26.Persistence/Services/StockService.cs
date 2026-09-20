using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Stock;
using Austo26.Application.Repositories;
using Austo26.Domain.Products;
using Austo26.Domain.Stock;

namespace Austo26.Persistence.Services;

public class StockService : IStockService
{
    // Konumu belirtilmemiş parçaların ekranda gösterilecek adı. Frontend
    // locationId == null olduğunda kendi çeviri metnini kullanır; bu metin
    // API'yi doğrudan tüketen istemciler için makul bir varsayılan.
    private const string UnassignedLocationName = "Konum belirtilmemiş";

    private readonly IStockMovementRepository _stockRepo;
    private readonly IProductRepository _productRepo;
    private readonly ILocationRepository _locationRepo;
    private readonly IStockItemRepository _stockItemRepo;

    public StockService(IStockMovementRepository stockRepo,
                        IProductRepository productRepo,
                        ILocationRepository locationRepo,
                        IStockItemRepository stockItemRepo)
    {
        _stockRepo     = stockRepo;
        _productRepo   = productRepo;
        _locationRepo  = locationRepo;
        _stockItemRepo = stockItemRepo;
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

    public async Task AdjustAsync(StockAdjustRequest request)
    {
        var product = await _productRepo.GetByIdAsync(request.ProductId)
                      ?? throw new Exception("Ürün bulunamadı.");

        if (request.Direction == "In")
            product.IncreaseStock(request.Quantity);
        else
            product.DecreaseStock(request.Quantity);

        var description = request.Notes
            ?? (request.Direction == "In" ? $"+{request.Quantity} stok girişi" : $"-{request.Quantity} stok çıkışı");

        var movement = new StockMovement(
            product.Id, request.Quantity, StockMovementType.Adjustment,
            null, null, description);

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

    // ── Konum bazlı stok ────────────────────────────────────────────────────
    //
    // Adet iki yerde duruyor: Product.StockQuantity toplamı, StockItem ise her
    // parçanın nerede olduğunu tutuyor. Ürün eklendiğinde parçası
    // oluşturulmadıysa toplam adet parça sayısından fazla oluyor; aradaki fark
    // "konumu belirtilmemiş" olarak ayrı gösteriliyor ki dağılımın toplamı her
    // zaman kullanıcının bildiği toplam adede eşit çıksın.

    public async Task<IEnumerable<LocationStockSummaryDto>> GetLocationSummariesAsync()
    {
        var available = await GetAvailableItemsAsync();
        var locations = await _locationRepo.GetAllAsync();

        var byLocation = available
            .Where(s => s.LocationId.HasValue)
            .GroupBy(s => s.LocationId!.Value)
            .ToDictionary(g => g.Key, g => g.ToList());

        var summaries = locations
            .Where(l => l.IsActive || byLocation.ContainsKey(l.Id))
            .Select(l =>
            {
                byLocation.TryGetValue(l.Id, out var items);
                items ??= [];
                return new LocationStockSummaryDto(
                    l.Id,
                    l.Name,
                    items.Select(s => s.ProductId).Distinct().Count(),
                    items.Count,
                    items.Sum(s => s.Product?.WeightGram ?? 0m),
                    items.Sum(s => s.Product?.SalePrice ?? 0m));
            })
            .OrderByDescending(s => s.TotalQuantity)
            .ThenBy(s => s.LocationName)
            .ToList();

        var unassigned = await BuildUnassignedSummaryAsync(available);
        if (unassigned is not null) summaries.Add(unassigned);

        return summaries;
    }

    public async Task<LocationStockDetailDto> GetLocationStockAsync(Guid? locationId)
    {
        if (locationId is null)
            return await BuildUnassignedDetailAsync();

        var location = await _locationRepo.GetByIdAsync(locationId.Value)
                       ?? throw new Exception("Konum bulunamadı.");

        var items = await _stockItemRepo.GetFilteredAsync(null, StockItemStatus.Available, location.Id);

        var products = items
            .GroupBy(s => s.ProductId)
            .Select(g =>
            {
                var product = g.First().Product;
                decimal quantity = g.Count();
                return new LocationProductQuantityDto(
                    g.Key,
                    product?.Name ?? "",
                    product?.Category?.Name ?? "Kategorisiz",
                    product?.Purity ?? default,
                    product?.WeightGram ?? 0m,
                    quantity,
                    (product?.WeightGram ?? 0m) * quantity,
                    (product?.SalePrice ?? 0m) * quantity);
            })
            .OrderByDescending(p => p.Quantity)
            .ThenBy(p => p.ProductName)
            .ToList();

        return new LocationStockDetailDto(
            location.Id,
            location.Name,
            location.Description,
            products.Sum(p => p.Quantity),
            products.Sum(p => p.TotalWeightGram),
            products.Sum(p => p.EstimatedValueTRY),
            products);
    }

    public async Task<IEnumerable<ProductLocationBreakdownDto>> GetProductBreakdownsAsync()
    {
        var available = await GetAvailableItemsAsync();
        var products = await _productRepo.GetAllAsync();

        var itemsByProduct = available
            .GroupBy(s => s.ProductId)
            .ToDictionary(g => g.Key, g => g.ToList());

        return products
            .Where(p => p.IsActive)
            .Select(p =>
            {
                itemsByProduct.TryGetValue(p.Id, out var items);
                return BuildBreakdown(p, items ?? []);
            })
            .Where(b => b.TotalQuantity > 0 || b.AssignedQuantity > 0)
            .OrderByDescending(b => b.TotalQuantity)
            .ThenBy(b => b.ProductName)
            .ToList();
    }

    public async Task<ProductLocationBreakdownDto> GetProductLocationBreakdownAsync(Guid productId)
    {
        var product = await _productRepo.GetByIdAsync(productId)
                      ?? throw new Exception("Ürün bulunamadı.");

        var items = await _stockItemRepo.GetFilteredAsync(productId, StockItemStatus.Available, null);
        return BuildBreakdown(product, items.ToList());
    }

    private static ProductLocationBreakdownDto BuildBreakdown(Product product, List<StockItem> availableItems)
    {
        var locations = availableItems
            .Where(s => s.LocationId.HasValue)
            .GroupBy(s => new { s.LocationId, Name = s.Location?.Name ?? "" })
            .Select(g => new ProductLocationQuantityDto(
                g.Key.LocationId,
                g.Key.Name,
                g.Count(),
                product.WeightGram * g.Count()))
            .OrderByDescending(l => l.Quantity)
            .ThenBy(l => l.LocationName)
            .ToList();

        decimal assigned = availableItems.Count(s => s.LocationId.HasValue);
        var unassigned = Math.Max(0m, product.StockQuantity - assigned);

        if (unassigned > 0)
            locations.Add(new ProductLocationQuantityDto(
                null, UnassignedLocationName, unassigned, product.WeightGram * unassigned));

        return new ProductLocationBreakdownDto(
            product.Id,
            product.Name,
            product.Category?.Name ?? "Kategorisiz",
            product.Purity,
            product.WeightGram,
            product.StockQuantity,
            assigned,
            unassigned,
            locations);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private async Task<List<StockItem>> GetAvailableItemsAsync()
    {
        var items = await _stockItemRepo.GetFilteredAsync(null, StockItemStatus.Available, null);
        return items.ToList();
    }

    /// <summary>Parçası oluşturulmamış (konumu belli olmayan) adetleri ürün bazında çıkarır.</summary>
    private async Task<List<(Product Product, decimal Quantity)>> GetUnassignedByProductAsync(
        List<StockItem> availableItems)
    {
        var assignedByProduct = availableItems
            .Where(s => s.LocationId.HasValue)
            .GroupBy(s => s.ProductId)
            .ToDictionary(g => g.Key, g => (decimal)g.Count());

        var products = await _productRepo.GetAllAsync();

        return products
            .Where(p => p.IsActive)
            .Select(p =>
            {
                assignedByProduct.TryGetValue(p.Id, out var assigned);
                return (Product: p, Quantity: Math.Max(0m, p.StockQuantity - assigned));
            })
            .Where(x => x.Quantity > 0)
            .ToList();
    }

    private async Task<LocationStockSummaryDto?> BuildUnassignedSummaryAsync(List<StockItem> availableItems)
    {
        var unassigned = await GetUnassignedByProductAsync(availableItems);
        if (unassigned.Count == 0) return null;

        return new LocationStockSummaryDto(
            null,
            UnassignedLocationName,
            unassigned.Count,
            unassigned.Sum(x => x.Quantity),
            unassigned.Sum(x => x.Product.WeightGram * x.Quantity),
            unassigned.Sum(x => x.Product.SalePrice * x.Quantity));
    }

    private async Task<LocationStockDetailDto> BuildUnassignedDetailAsync()
    {
        var available = await GetAvailableItemsAsync();
        var unassigned = await GetUnassignedByProductAsync(available);

        var products = unassigned
            .Select(x => new LocationProductQuantityDto(
                x.Product.Id,
                x.Product.Name,
                x.Product.Category?.Name ?? "Kategorisiz",
                x.Product.Purity,
                x.Product.WeightGram,
                x.Quantity,
                x.Product.WeightGram * x.Quantity,
                x.Product.SalePrice * x.Quantity))
            .OrderByDescending(p => p.Quantity)
            .ThenBy(p => p.ProductName)
            .ToList();

        return new LocationStockDetailDto(
            null,
            UnassignedLocationName,
            null,
            products.Sum(p => p.Quantity),
            products.Sum(p => p.TotalWeightGram),
            products.Sum(p => p.EstimatedValueTRY),
            products);
    }
}
