using Austo26.Domain.Products;

namespace Austo26.Application.DTOs.Products;

public record ProductDto(
    Guid Id,
    string Name,
    Guid CategoryId,
    string CategoryName,
    decimal WeightGram,
    GoldPurity Purity,
    decimal PurchasePrice,
    decimal SalePrice,
    decimal StockQuantity,
    string? Barcode,
    bool IsActive
);

public class ProductQrDto
{
    public string Name { get; set; } = string.Empty;
    public decimal SalePrice { get; set; }
    public decimal WeightGram { get; set; }
    public GoldPurity Purity { get; set; }
    public byte[] QrCodeImage { get; set; } = Array.Empty<byte>();
}
