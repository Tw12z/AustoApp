using Austo26.Application.DTOs.Products;
using Austo26.Domain.Products;

namespace Austo26.Application.Repositories;

public interface IProductRepository : IBaseRepository<Product>
{
    Task<Product?> GetByIdAsync(Guid id);
    Task<IEnumerable<ProductDto>> GetAllWithDetailsAsync();
    Task<Product?> GetByBarcodeOrIdAsync(string code);
}
