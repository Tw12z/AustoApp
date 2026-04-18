using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Stock;
using Austo26.Application.Repositories;
using Austo26.Domain.Stock;

namespace Austo26.Persistence.Services;

public class StockItemService : IStockItemService
{
    private readonly IStockItemRepository _repo;
    private readonly IProductRepository _productRepo;
    private readonly ILocationRepository _locationRepo;
    private readonly IQRService _qrService;

    public StockItemService(
        IStockItemRepository repo,
        IProductRepository productRepo,
        ILocationRepository locationRepo,
        IQRService qrService)
    {
        _repo = repo;
        _productRepo = productRepo;
        _locationRepo = locationRepo;
        _qrService = qrService;
    }

    public async Task<StockItemDto?> GetByIdAsync(Guid id)
    {
        var item = await _repo.GetByIdWithDetailsAsync(id);
        return item is null ? null : ToDto(item);
    }

    public async Task<StockItemDto?> GetByCodeAsync(string itemCode)
    {
        var item = await _repo.GetByCodeAsync(itemCode);
        return item is null ? null : ToDto(item);
    }

    public async Task<IEnumerable<StockItemDto>> GetByProductAsync(Guid productId)
    {
        var items = await _repo.GetByProductAsync(productId);
        return items.Select(ToDto);
    }

    public async Task<IEnumerable<StockItemDto>> GetFilteredAsync(Guid? productId, StockItemStatus? status, Guid? locationId)
    {
        var items = await _repo.GetFilteredAsync(productId, status, locationId);
        return items.Select(ToDto);
    }

    public async Task<IEnumerable<StockItemDto>> CreateBatchAsync(CreateStockItemBatchRequest request)
    {
        if (request.Count <= 0) throw new Exception("Adet 1'den büyük olmalıdır.");
        if (request.Count > 500) throw new Exception("Tek seferde en fazla 500 parça oluşturulabilir.");

        var product = await _productRepo.GetByIdAsync(request.ProductId)
                      ?? throw new Exception("Ürün bulunamadı.");

        var lastSeq = await _repo.GetLastSequenceAsync();
        var created = new List<StockItem>(request.Count);

        for (int i = 0; i < request.Count; i++)
        {
            var code = $"AUSTO-{(lastSeq + i + 1):D5}";
            var item = new StockItem(code, request.ProductId, request.LocationId,
                                     request.PurchaseTransactionId, request.Notes);
            await _repo.AddAsync(item);
            created.Add(item);
        }

        await _repo.SaveChangesAsync();

        // Reload with navigation props
        var ids = created.Select(c => c.Id).ToList();
        var detailed = await _repo.GetFilteredAsync(request.ProductId, null, null);
        return detailed.Where(d => ids.Contains(d.Id)).Select(ToDto);
    }

    public async Task TransferAsync(Guid itemId, StockItemTransferRequest request)
    {
        var item = await _repo.GetByIdWithDetailsAsync(itemId)
                   ?? throw new Exception("Parça bulunamadı.");

        if (item.Status != StockItemStatus.Available)
            throw new Exception($"Bu parça {item.Status} durumunda, transfer yapılamaz.");

        _ = await _locationRepo.GetByIdAsync(request.ToLocationId)
            ?? throw new Exception("Hedef konum bulunamadı.");

        item.Transfer(request.ToLocationId, request.Notes);
        await _repo.SaveChangesAsync();
    }

    public async Task MarkDamagedAsync(Guid itemId, StockItemDamageRequest request)
    {
        var item = await _repo.GetByIdWithDetailsAsync(itemId)
                   ?? throw new Exception("Parça bulunamadı.");

        if (item.Status == StockItemStatus.Sold)
            throw new Exception("Satılmış parça hasarlı/kayıp olarak işaretlenemez.");

        if (request.Reason == "Lost")
            item.MarkLost(request.Notes);
        else
            item.MarkDamaged(request.Notes);

        await _repo.SaveChangesAsync();
    }

    public async Task<byte[]> GetQRAsync(Guid itemId)
    {
        var item = await _repo.GetByIdWithDetailsAsync(itemId)
                   ?? throw new Exception("Parça bulunamadı.");

        return _qrService.GenerateQRCode(item.ItemCode);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────
    private static StockItemDto ToDto(StockItem s) => new(
        s.Id,
        s.ItemCode,
        s.ProductId,
        s.Product?.Name ?? "",
        s.Product?.Purity ?? default,
        s.Product?.WeightGram ?? 0,
        s.LocationId,
        s.Location?.Name,
        s.Status,
        s.PurchaseTransactionId,
        s.Notes,
        s.CreatedAt
    );
}
