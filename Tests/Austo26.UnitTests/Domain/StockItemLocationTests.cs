using Austo26.Domain.Stock;

namespace Austo26.UnitTests.Domain;

/// <summary>
/// Parça bazlı stok ve konum takibi. Bir ürünün "kaç adet" olduğu
/// Product.StockQuantity'de, "nerede" olduğu ise StockItem.LocationId'de
/// tutuluyor; bu testler konum bilgisinin doğru taşındığını ve konumu
/// girilmemiş parçaların ayırt edilebilir kaldığını güvenceye alır.
/// </summary>
public class StockItemLocationTests
{
    private static StockItem CreateItem(Guid? locationId = null) =>
        new("AUSTO-00001", Guid.NewGuid(), locationId);

    [Fact]
    public void Yeni_Parca_SatilabilirDurumdaVeVerilenKonumdaBaslar()
    {
        var locationId = Guid.NewGuid();

        var item = CreateItem(locationId);

        Assert.Equal(StockItemStatus.Available, item.Status);
        Assert.Equal(locationId, item.LocationId);
        Assert.Equal("AUSTO-00001", item.ItemCode);
    }

    [Fact]
    public void Yeni_Parca_KonumVerilmezseKonumuBelirtilmemisKalir()
    {
        // Konumu olmayan parçalar arayüzde "konum belirtilmemiş" olarak
        // gösteriliyor; burada null kalmazsa o ayrım kaybolur.
        var item = CreateItem(locationId: null);

        Assert.Null(item.LocationId);
    }

    [Fact]
    public void Transfer_ParcayiYeniKonumaTasirVeDurumunuDegistirmez()
    {
        var item = CreateItem(Guid.NewGuid());
        var hedef = Guid.NewGuid();

        item.Transfer(hedef, "Atölyeye gönderildi");

        Assert.Equal(hedef, item.LocationId);
        Assert.Equal(StockItemStatus.Available, item.Status);
        Assert.Equal("Atölyeye gönderildi", item.Notes);
        Assert.NotNull(item.UpdatedAt);
    }

    [Fact]
    public void Transfer_NotVerilmezseMevcutNotuSilmez()
    {
        var item = new StockItem("AUSTO-00002", Guid.NewGuid(), Guid.NewGuid(), notes: "Vitrin parçası");

        item.Transfer(Guid.NewGuid());

        Assert.Equal("Vitrin parçası", item.Notes);
    }

    [Fact]
    public void Transfer_KonumuBelirtilmemisBirParcayaKonumVerebilir()
    {
        var item = CreateItem(locationId: null);
        var hedef = Guid.NewGuid();

        item.Transfer(hedef);

        Assert.Equal(hedef, item.LocationId);
    }

    [Fact]
    public void MarkSold_ParcayiSatildiYaparVeSatisKalemineBaglar()
    {
        var item = CreateItem(Guid.NewGuid());
        var satisKalemi = Guid.NewGuid();

        item.MarkSold(satisKalemi);

        Assert.Equal(StockItemStatus.Sold, item.Status);
        Assert.Equal(satisKalemi, item.SaleTransactionItemId);
    }

    [Fact]
    public void MarkDamaged_VeMarkLost_DurumuDegistirirVeNotuYazar()
    {
        var hasarli = CreateItem(Guid.NewGuid());
        var kayip = CreateItem(Guid.NewGuid());

        hasarli.MarkDamaged("Taşı düştü");
        kayip.MarkLost("Sayımda çıkmadı");

        Assert.Equal(StockItemStatus.Damaged, hasarli.Status);
        Assert.Equal("Taşı düştü", hasarli.Notes);
        Assert.Equal(StockItemStatus.Lost, kayip.Status);
        Assert.Equal("Sayımda çıkmadı", kayip.Notes);
    }

    [Fact]
    public void SatilanParca_KonumDagilimindaSayilmamasiIcinDurumunuKorur()
    {
        // Konum dağılımı yalnızca Available parçalar üzerinden hesaplanıyor.
        // Satılmış bir parçanın konumu hâlâ dolu olabilir; ayırt eden şey durumu.
        var item = CreateItem(Guid.NewGuid());
        item.MarkSold(Guid.NewGuid());

        item.Transfer(Guid.NewGuid());

        Assert.Equal(StockItemStatus.Sold, item.Status);
    }
}
