using Austo26.Domain.Customers;
using Austo26.Domain.Entities.Locations;

namespace Austo26.UnitTests.Domain;

public class LocationTests
{
    [Fact]
    public void Yeni_Konum_AktifBaslarVeAdindakiBosluklariKirpar()
    {
        var location = new Location("  Atölye  ", "  Arka oda  ");

        Assert.Equal("Atölye", location.Name);
        Assert.Equal("Arka oda", location.Description);
        Assert.True(location.IsActive);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Yeni_Konum_BosAdiReddeder(string name)
    {
        Assert.Throws<ArgumentException>(() => new Location(name));
    }

    [Fact]
    public void Rename_KonumAdiniDegistirir()
    {
        var location = new Location("Dükkan");

        location.Rename("Vitrin");

        Assert.Equal("Vitrin", location.Name);
        Assert.NotNull(location.UpdatedAt);
    }

    [Fact]
    public void Deactivate_KonumuPasifeAlir()
    {
        var location = new Location("Kasa");

        location.Deactivate();

        Assert.False(location.IsActive);
    }
}

public class CustomerTests
{
    [Fact]
    public void Yeni_Musteri_ZorunluAlanlariKirparVeBosSecmeliAlanlariNullYapar()
    {
        var customer = new Customer("  Ayşe Yılmaz  ", "  0555 000 00 00  ", email: "  ", taxNumber: "  ", notes: "  ");

        Assert.Equal("Ayşe Yılmaz", customer.FullName);
        Assert.Equal("0555 000 00 00", customer.Phone);
        Assert.Null(customer.Email);
        Assert.Null(customer.TaxNumber);
        Assert.Null(customer.Notes);
        Assert.True(customer.IsActive);
    }

    [Theory]
    [InlineData("", "0555")]
    [InlineData("Ad Soyad", "")]
    public void Yeni_Musteri_BosAdVeyaTelefonuReddeder(string fullName, string phone)
    {
        Assert.Throws<ArgumentException>(() => new Customer(fullName, phone));
    }
}
