using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Products;
using Austo26.Application.Repositories;
using Austo26.Domain.Products;

namespace Austo26.Persistence.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repo;
    private readonly IQRService _qrService;

    public ProductService(IProductRepository repo, IQRService qrService)
    {
        _repo      = repo;
        _qrService = qrService;
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
        var product = new Product(request.Name, request.CategoryId, request.WeightGram, request.Purity,
                                  request.PurchasePrice, request.SalePrice, request.StockQuantity, request.Barcode);
        await _repo.AddAsync(product);
        await _repo.SaveChangesAsync();
        return product;
    }

    public async Task UpdateAsync(Guid id, UpdateProductRequest request)
    {
        var product = await _repo.GetByIdAsync(id) ?? throw new Exception("Ürün bulunamadı.");
        product.UpdateInfo(request.Name, request.WeightGram, request.Purity, request.Barcode);
        product.UpdatePrices(request.PurchasePrice, request.SalePrice);
        await _repo.SaveChangesAsync();
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
