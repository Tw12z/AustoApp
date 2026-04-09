using Austo26.Domain.Categories;
using Austo26.Domain.Entities.Common;

namespace Austo26.Domain.Products;

public class Product : BaseEntity
{
    public string Name { get; private set; }
    public Guid CategoryId { get; private set; }
    public decimal WeightGram { get; private set; }      // Gram cinsinden ağırlık
    public GoldPurity Purity { get; private set; }       // Ayar (14k, 18k, 22k, 24k...)
    public decimal PurchasePrice { get; private set; }   // Alış fiyatı (TRY)
    public decimal SalePrice { get; private set; }       // Satış fiyatı (TRY)
    public decimal StockQuantity { get; private set; }   // Adet
    public string? Barcode { get; private set; }
    public bool IsActive { get; private set; }

    public Category Category { get; private set; } = null!;

    protected Product() { Name = null!; }

    public Product(string name, Guid categoryId, decimal weightGram, GoldPurity purity,
                   decimal purchasePrice, decimal salePrice, decimal stockQuantity, string? barcode = null)
    {
        SetName(name);
        CategoryId = categoryId;
        SetWeight(weightGram);
        Purity = purity;
        SetPrices(purchasePrice, salePrice);
        if (stockQuantity < 0) throw new ArgumentException("Başlangıç stoğu negatif olamaz.");
        StockQuantity = stockQuantity;
        Barcode = string.IsNullOrWhiteSpace(barcode) ? null : barcode.Trim();
        IsActive = true;
    }

    public void UpdateInfo(string name, decimal weightGram, GoldPurity purity, string? barcode)
    {
        SetName(name);
        SetWeight(weightGram);
        Purity = purity;
        Barcode = string.IsNullOrWhiteSpace(barcode) ? null : barcode.Trim();
        Touch();
    }

    public void UpdatePrices(decimal purchasePrice, decimal salePrice)
    {
        SetPrices(purchasePrice, salePrice);
        Touch();
    }

    public void IncreaseStock(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Artış miktarı sıfırdan büyük olmalıdır.", nameof(amount));
        StockQuantity += amount;
        Touch();
    }

    public void DecreaseStock(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Azalma miktarı sıfırdan büyük olmalıdır.", nameof(amount));
        if (StockQuantity - amount < 0) throw new InvalidOperationException("Stok miktarı sıfırın altına düşemez.");
        StockQuantity -= amount;
        Touch();
    }

    public void Deactivate() { IsActive = false; Touch(); }
    public void Activate() { IsActive = true; Touch(); }

    private void SetName(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Ürün adı boş olamaz.", nameof(name));
        Name = name.Trim();
    }

    private void SetWeight(decimal weightGram)
    {
        if (weightGram < 0) throw new ArgumentException("Ağırlık negatif olamaz.", nameof(weightGram));
        WeightGram = weightGram;
    }

    private void SetPrices(decimal purchasePrice, decimal salePrice)
    {
        if (purchasePrice < 0 || salePrice < 0) throw new ArgumentException("Fiyatlar negatif olamaz.");
        PurchasePrice = purchasePrice;
        SalePrice = salePrice;
    }
}
