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
    string? Barcode,
    // Opsiyonel başlangıç konumu. Verilirse StockQuantity kadar parça
    // (AUSTO-XXXXX) bu konumda oluşturulur; böylece ürün eklenir eklenmez
    // konum bazlı dağılımda görünür. Boş bırakılırsa adet "konumu
    // belirtilmemiş" olarak kalır ve Stok Girişi'nden konumlandırılabilir.
    Guid? LocationId = null
);

public record UpdateProductRequest(
    string Name,
    decimal WeightGram,
    GoldPurity Purity,
    decimal PurchasePrice,
    decimal SalePrice,
    string? Barcode,
    // Formda gösterilen stok adedi buraya kadar gelmiyordu; kullanıcı adedi
    // değiştirip kaydettiğinde sunucu sessizce eski değeri koruyordu.
    // null gönderilirse (eski istemciler) adet değiştirilmez.
    decimal? StockQuantity = null
);
