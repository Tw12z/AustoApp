using Austo26.Domain.Stock;

namespace Austo26.UnitTests.Domain;

public class StockMovementTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(-2)]
    public void Yeni_Hareket_SifirVeyaNegatifMiktariReddeder(decimal quantity)
    {
        Assert.Throws<ArgumentException>(() =>
            new StockMovement(Guid.NewGuid(), quantity, StockMovementType.Purchase));
    }

    [Fact]
    public void Yeni_Transfer_KaynakVeHedefKonumuBirlikteSaklar()
    {
        var kaynak = Guid.NewGuid();
        var hedef = Guid.NewGuid();

        var movement = new StockMovement(Guid.NewGuid(), 3m, StockMovementType.Transfer, kaynak, hedef, "Dükkan → Atölye");

        Assert.Equal(kaynak, movement.LocationId);
        Assert.Equal(hedef, movement.ToLocationId);
        Assert.Equal(StockMovementType.Transfer, movement.Type);
        Assert.Equal(3m, movement.Quantity);
    }
}
