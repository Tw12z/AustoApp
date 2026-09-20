using Austo26.Domain.Products;
using Austo26.Domain.Transactions;

namespace Austo26.UnitTests.Domain;

public class PurchaseTransactionTests
{
    private static PurchaseTransaction CreatePurchase(decimal totalAmount = 10_000m, decimal weightGram = 20m) =>
        new(new DateTime(2026, 9, 20, 10, 0, 0, DateTimeKind.Utc), totalAmount, weightGram,
            GoldPurity.K22, PurchaseSourceType.Supplier, supplierId: Guid.NewGuid());

    [Fact]
    public void Yeni_Alis_TamamlandiDurumuylaBaslar()
    {
        var purchase = CreatePurchase();

        Assert.Equal(TransactionStatus.Completed, purchase.Status);
        Assert.Equal(10_000m, purchase.TotalAmountTRY);
        Assert.Equal(20m, purchase.WeightGram);
    }

    [Fact]
    public void Yeni_Alis_NegatifTutariReddeder()
    {
        Assert.Throws<ArgumentException>(() => CreatePurchase(totalAmount: -1m));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void Yeni_Alis_SifirVeyaNegatifGramiReddeder(decimal weightGram)
    {
        Assert.Throws<ArgumentException>(() => CreatePurchase(weightGram: weightGram));
    }

    [Fact]
    public void Cancel_AlisiIptalEder()
    {
        var purchase = CreatePurchase();

        purchase.Cancel();

        Assert.Equal(TransactionStatus.Cancelled, purchase.Status);
    }
}
