using Austo26.Application.DTOs.Products;
using Austo26.Application.Repositories;
using Austo26.Domain.Products;
using Austo26.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Austo26.Persistence.Repositories;

public class ProductRepository : BaseRepository<Product>, IProductRepository
{
    public ProductRepository(AppDbContext context) : base(context, context.Products) { }

    public async Task<Product?> GetByIdAsync(Guid id)
        => await _dbSet.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<IEnumerable<ProductDto>> GetAllWithDetailsAsync()
        => await _dbSet
            .Include(p => p.Category)
            .Select(p => new ProductDto(
                p.Id, p.Name,
                p.CategoryId,
                p.Category != null ? p.Category.Name : "Kategorisiz",
                p.WeightGram, p.Purity,
                p.PurchasePrice, p.SalePrice,
                p.StockQuantity, p.Barcode, p.IsActive))
            .ToListAsync();
}
