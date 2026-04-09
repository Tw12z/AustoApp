namespace Austo26.Domain.Stock;

public enum StockMovementType
{
    Purchase   = 1,  // Satın alma (stok giriş)
    Sale       = 2,  // Satış (stok çıkış)
    Transfer   = 3,  // Lokasyon transferi
    Adjustment = 4,  // Manuel düzeltme
    Waste      = 5   // Fire / kayıp
}
