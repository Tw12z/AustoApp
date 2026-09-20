using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Products;
using Austo26.Application.Repositories;
using Austo26.Domain.Products;
using Austo26.Domain.Stock;

namespace Austo26.Persistence.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repo;
    private readonly IQRService _qrService;
    private readonly IStockItemRepository _stockItemRepo;
    private readonly ILocationRepository _locationRepo;

    public ProductService(IProductRepository repo,
                          IQRService qrService,
                          IStockItemRepository stockItemRepo,
                          ILocationRepository locationRepo)
    {
        _repo          = repo;
        _qrService     = qrService;
        _stockItemRepo = stockItemRepo;
        _locationRepo  = locationRepo;
    }

    public async Task<IEnumerable<ProductDto>> GetAllAsync() => await _repo.GetAllWithDetailsAsync();

    public async Task<ProductDto?> GetByIdAsync(Guid id)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) return null;
        return new ProductDto(p.Id, p.Name, p.CategoryId, p.Category?.Name ?? "Kategorisiz",
                              p.WeightGram, p.Purity, p.PurchasePrice,
                              p.SalePrice, p.StockQuantity, p.Barcode, p.IsActive);
    }

    public async Task<Product> CreateAsync(CreateProductRequest request)
    {
        // Konum geçersizse ürün hiç oluşturulmasın diye önce doğrulanıyor.
        if (request.LocationId.HasValue)
            _ = await _locationRepo.GetByIdAsync(request.LocationId.Value)
                ?? throw new Exception("Konum bulunamadı.");

        var product = new Product(request.Name, request.CategoryId, request.WeightGram, request.Purity,
                                  request.PurchasePrice, request.SalePrice, request.StockQuantity, request.Barcode);
        await _repo.AddAsync(product);
        await _repo.SaveChangesAsync();

        if (request.LocationId.HasValue)
            await CreateStockItemsAtLocationAsync(product, request.LocationId.Value, request.StockQuantity);

        return product;
    }

    public async Task UpdateAsync(Guid id, UpdateProductRequest request)
    {
        var product = await _repo.GetByIdAsync(id) ?? throw new Exception("Ürün bulunamadı.");
        product.UpdateInfo(request.Name, request.WeightGram, request.Purity, request.Barcode);
        product.UpdatePrices(request.PurchasePrice, request.SalePrice);

        if (request.StockQuantity.HasValue)
        {
            var delta = request.StockQuantity.Value - product.StockQuantity;
            if (delta > 0) product.IncreaseStock(delta);
            else if (delta < 0) product.DecreaseStock(-delta);
        }

        await _repo.SaveChangesAsync();
    }

    /// <summary>
    /// Ürün eklenirken bir başlangıç konumu seçildiyse, adet kadar parça
    /// (StockItem) o konumda oluşturur. Parça kodları Stok Girişi ekranıyla
    /// aynı AUSTO-XXXXX dizisinden devam eder. Adet tam sayı değilse (gramla
    /// takip edilen hurda gibi) parça üretilmez; adet toplamda durur.
    /// </summary>
    private async Task CreateStockItemsAtLocationAsync(Product product, Guid locationId, decimal quantity)
    {
        // Parça başına bir kayıt tutuluyor; Stok Girişi ekranıyla aynı 500'lük
        // üst sınır geçerli. Sınırın üstündeki adet toplamda kalır, ürün yine
        // oluşmuştur — kullanıcı kalanı Stok Girişi'nden konumlandırabilir.
        if (quantity <= 0 || quantity != decimal.Truncate(quantity) || quantity > 500) return;

        var count = (int)quantity;
        var lastSeq = await _stockItemRepo.GetLastSequenceAsync();

        for (int i = 0; i < count; i++)
        {
            var code = $"AUSTO-{(lastSeq + i + 1):D5}";
            await _stockItemRepo.AddAsync(new StockItem(code, product.Id, locationId));
        }

        await _stockItemRepo.SaveChangesAsync();
    }

    public async Task DeactivateAsync(Guid id)
    {
        var product = await _repo.GetByIdAsync(id) ?? throw new Exception("Ürün bulunamadı.");
        product.Deactivate();
        await _repo.SaveChangesAsync();
    }

    public async Task<ProductDto?> GetByBarcodeAsync(string code)
    {
        var p = await _repo.GetByBarcodeOrIdAsync(code);
        if (p is null) return null;
        return new ProductDto(p.Id, p.Name, p.CategoryId, p.Category?.Name ?? "Kategorisiz",
                              p.WeightGram, p.Purity, p.PurchasePrice,
                              p.SalePrice, p.StockQuantity, p.Barcode, p.IsActive);
    }

    public async Task<ProductQrDto> GetQRAsync(Guid id)
    {
        var product = await _repo.GetByIdAsync(id) ?? throw new Exception("Ürün bulunamadı.");
        var qrBytes = _qrService.GenerateQRCode(product.Id.ToString());
        return new ProductQrDto
        {
            Name       = product.Name,
            SalePrice  = product.SalePrice,
            WeightGram = product.WeightGram,
            Purity     = product.Purity,
            QrCodeImage = qrBytes
        };
    }
}
