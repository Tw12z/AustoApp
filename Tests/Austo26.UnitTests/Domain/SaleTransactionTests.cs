using Austo26.Domain.Transactions;

namespace Austo26.UnitTests.Domain;

/// <summary>
/// Satış toplamları. Fiş tutarı ve toplam gram doğrudan bu hesaptan geliyor;
/// adetle çarpım unutulursa müşteriye eksik fatura kesilir.
/// </summary>
public class SaleTransactionTests
{
    private static SaleTransaction CreateSale() =>
        new(Guid.NewGuid(), new DateTime(2026, 9, 20, 10, 0, 0, DateTimeKind.Utc));

    [Fact]
    public void Yeni_Satis_BeklemedeVeSifirToplamlaBaslar()
    {
        var sale = CreateSale();

        Assert.Equal(TransactionStatus.Pending, sale.Status);
        Assert.Equal(0m, sale.TotalAmountTRY);
        Assert.Equal(0m, sale.TotalWeightGram);
        Assert.Empty(sale.Items);
    }

    [Fact]
    public void AddItem_TutariVeGramiAdetleCarparakToplar()
    {
        var sale = CreateSale();

        sale.AddItem(new SaleTransactionItem(sale.Id, Guid.NewGuid(), quantity: 2m, unitPriceTRY: 1_500m, weightGram: 3.5m));

        Assert.Equal(3_000m, sale.TotalAmountTRY);
        Assert.Equal(7m, sale.TotalWeightGram);
    }

    [Fact]
    public void AddItem_BirdenFazlaKalemiBirikimliToplar()
    {
        var sale = CreateSale();

        sale.AddItem(new SaleTransactionItem(sale.Id, Guid.NewGuid(), 2m, 1_500m, 3.5m));
        sale.AddItem(new SaleTransactionItem(sale.Id, Guid.NewGuid(), 1m, 12_250.75m, 10.25m));

        Assert.Equal(15_250.75m, sale.TotalAmountTRY);
        Assert.Equal(17.25m, sale.TotalWeightGram);
        Assert.Equal(2, sale.Items.Count);
    }

    [Fact]
    public void Complete_SatisiTamamlandiYapar()
    {
        var sale = CreateSale();

        sale.Complete();

        Assert.Equal(TransactionStatus.Completed, sale.Status);
        Assert.NotNull(sale.UpdatedAt);
    }

    [Fact]
    public void Cancel_SatisiIptalEder()
    {
        var sale = CreateSale();
        sale.Complete();

        sale.Cancel();

        Assert.Equal(TransactionStatus.Cancelled, sale.Status);
    }

    [Theory]
    [InlineData(0, 100, 1)]        // adet sıfır olamaz
    [InlineData(-1, 100, 1)]       // adet negatif olamaz
    [InlineData(1, -100, 1)]       // birim fiyat negatif olamaz
    [InlineData(1, 100, -1)]       // gram negatif olamaz
    public void Yeni_SatisKalemi_GecersizDegerleriReddeder(decimal quantity, decimal unitPrice, decimal weightGram)
    {
        Assert.Throws<ArgumentException>(() =>
            new SaleTransactionItem(Guid.NewGuid(), Guid.NewGuid(), quantity, unitPrice, weightGram));
    }
}
