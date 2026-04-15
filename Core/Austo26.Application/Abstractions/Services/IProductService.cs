using Austo26.Application.DTOs.Products;
using Austo26.Domain.Products;

namespace Austo26.Application.Abstractions.Services;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllAsync();
    Task<ProductDto?> GetByIdAsync(Guid id);
    Task<Product> CreateAsync(CreateProductRequest request);
    Task UpdateAsync(Guid id, UpdateProductRequest request);
    Task DeactivateAsync(Guid id);
    Task<ProductQrDto> GetQRAsync(Guid id);
    Task<ProductDto?> GetByBarcodeAsync(string code);
}
