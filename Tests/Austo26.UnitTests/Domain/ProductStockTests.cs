using Austo26.Domain.Products;

namespace Austo26.UnitTests.Domain;

/// <summary>
/// Ürün stok miktarı kuralları. Stok adedi, dükkândaki toplam adedin tek
/// kaynağı; eksiye düşmesi veya sessizce değişmesi sayımı bozar.
/// </summary>
public class ProductStockTests
{
    private static Product CreateProduct(decimal stockQuantity = 10m) =>
        new("22 Ayar Bilezik", Guid.NewGuid(), weightGram: 15.5m, GoldPurity.K22,
            purchasePrice: 30_000m, salePrice: 35_000m, stockQuantity: stockQuantity);

    [Fact]
    public void Yeni_Urun_VerilenStokMiktariylaVeAktifOlarakBaslar()
    {
        var product = CreateProduct(7m);

        Assert.Equal(7m, product.StockQuantity);
        Assert.True(product.IsActive);
    }

    [Fact]
    public void Yeni_Urun_NegatifStokIleOlusturulamaz()
    {
        Assert.Throws<ArgumentException>(() => CreateProduct(-1m));
    }

    [Fact]
    public void IncreaseStock_MiktariArtirir()
    {
        var product = CreateProduct(10m);

        product.IncreaseStock(2.5m);

        Assert.Equal(12.5m, product.StockQuantity);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-3)]
    public void IncreaseStock_SifirVeyaNegatifMiktariReddeder(decimal amount)
    {
        var product = CreateProduct(10m);

        Assert.Throws<ArgumentException>(() => product.IncreaseStock(amount));
        Assert.Equal(10m, product.StockQuantity);
    }

    [Fact]
    public void DecreaseStock_MiktariAzaltir()
    {
        var product = CreateProduct(10m);

        product.DecreaseStock(4m);

        Assert.Equal(6m, product.StockQuantity);
    }

    [Fact]
    public void DecreaseStock_StoguTamOlarakSifiraIndirebilir()
    {
        var product = CreateProduct(3m);

        product.DecreaseStock(3m);

        Assert.Equal(0m, product.StockQuantity);
    }

    [Fact]
    public void DecreaseStock_StokEksiyeDuserseIslemiReddederVeMiktariDegistirmez()
    {
        var product = CreateProduct(2m);

        Assert.Throws<InvalidOperationException>(() => product.DecreaseStock(3m));
        Assert.Equal(2m, product.StockQuantity);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Yeni_Urun_BosIsimReddedilir(string name)
    {
        Assert.Throws<ArgumentException>(() =>
            new Product(name, Guid.NewGuid(), 1m, GoldPurity.K14, 1m, 2m, 1m));
    }

    [Fact]
    public void Yeni_Urun_NegatifAgirlikVeyaFiyatReddedilir()
    {
        Assert.Throws<ArgumentException>(() =>
            new Product("Yüzük", Guid.NewGuid(), -1m, GoldPurity.K14, 1m, 2m, 1m));
        Assert.Throws<ArgumentException>(() =>
            new Product("Yüzük", Guid.NewGuid(), 1m, GoldPurity.K14, -1m, 2m, 1m));
        Assert.Throws<ArgumentException>(() =>
            new Product("Yüzük", Guid.NewGuid(), 1m, GoldPurity.K14, 1m, -2m, 1m));
    }

    [Fact]
    public void Yeni_Urun_IsimVeBarkoddakiBosluklariKirpar()
    {
        var product = new Product("  Tek Taş Yüzük  ", Guid.NewGuid(), 2m, GoldPurity.K18,
            10m, 20m, 1m, barcode: "  8690000000001  ");

        Assert.Equal("Tek Taş Yüzük", product.Name);
        Assert.Equal("8690000000001", product.Barcode);
    }

    [Fact]
    public void Yeni_Urun_BosBarkoduNullaCevirir()
    {
        var product = new Product("Künye", Guid.NewGuid(), 2m, GoldPurity.K18, 10m, 20m, 1m, barcode: "   ");

        Assert.Null(product.Barcode);
    }

    [Fact]
    public void UpdatePrices_FiyatlariDegistirirVeGuncellemeZamaniniIsaretler()
    {
        var product = CreateProduct();
        Assert.Null(product.UpdatedAt);

        product.UpdatePrices(31_000m, 36_000m);

        Assert.Equal(31_000m, product.PurchasePrice);
        Assert.Equal(36_000m, product.SalePrice);
        Assert.NotNull(product.UpdatedAt);
    }
}
