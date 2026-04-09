using Austo26.Domain.Products;

namespace Austo26.Application.DTOs.Products;

public record CreateProductRequest(
    string Name,
    Guid CategoryId,
    decimal WeightGram,
    GoldPurity Purity,
    decimal PurchasePrice,
    decimal SalePrice,
    decimal StockQuantity,
    string? Barcode
);

public record UpdateProductRequest(
    string Name,
    decimal WeightGram,
    GoldPurity Purity,
    decimal PurchasePrice,
    decimal SalePrice,
    string? Barcode
);
