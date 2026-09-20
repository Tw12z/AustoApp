using System.Text;
using Austo26.Application.Security;

namespace Austo26.UnitTests.Security;

/// <summary>
/// Parola hashleme sözleşmesi.
///
/// Bu testler bilerek algoritmadan bağımsız yazıldı: içerideki algoritma
/// değişse bile (ör. HMACSHA512 -> PBKDF2) "doğru parola doğrulanır, yanlış
/// parola reddedilir, parola düz metin saklanmaz" kuralları korunmalıdır.
/// Bir regresyon buraya düşerse, giriş güvenliği bozulmuş demektir.
/// </summary>
public class HashingHelperTests
{
    [Theory]
    [InlineData("Admin123!")]
    [InlineData("kısa")]
    [InlineData("İstanbul Kuyumculuk ÇĞÜŞÖ 2026")]   // Türkçe karakterler
    [InlineData("  boşluklu  parola  ")]
    [InlineData("a")]
    public void VerifyPasswordHash_DogruParolayiKabulEder(string password)
    {
        HashingHelper.CreatePasswordHash(password, out var hash, out var salt);

        Assert.True(HashingHelper.VerifyPasswordHash(password, hash, salt));
    }

    [Theory]
    [InlineData("Admin123!", "Admin123")]
    [InlineData("Admin123!", "admin123!")]      // büyük/küçük harfe duyarlı olmalı
    [InlineData("Admin123!", "")]
    [InlineData("Admin123!", "Admin123! ")]     // sondaki boşluk kırpılmamalı
    public void VerifyPasswordHash_YanlisParolayiReddeder(string password, string attempt)
    {
        HashingHelper.CreatePasswordHash(password, out var hash, out var salt);

        Assert.False(HashingHelper.VerifyPasswordHash(attempt, hash, salt));
    }

    [Fact]
    public void CreatePasswordHash_AyniParolaIcinHerSeferindeFarkliHashUretir()
    {
        // Her kullanıcı için ayrı salt üretilmezse, aynı parolayı kullanan iki
        // kullanıcı aynı hash'e sahip olur ve tablo halinde kırılabilir.
        HashingHelper.CreatePasswordHash("Admin123!", out var hash1, out var salt1);
        HashingHelper.CreatePasswordHash("Admin123!", out var hash2, out var salt2);

        Assert.NotEqual(salt1, salt2);
        Assert.NotEqual(hash1, hash2);
    }

    [Fact]
    public void VerifyPasswordHash_BaskaKullanicininSaltiIleDogrulanmaz()
    {
        HashingHelper.CreatePasswordHash("Admin123!", out var hash1, out _);
        HashingHelper.CreatePasswordHash("Admin123!", out _, out var salt2);

        Assert.False(HashingHelper.VerifyPasswordHash("Admin123!", hash1, salt2));
    }

    [Fact]
    public void CreatePasswordHash_ParolayiDuzMetinOlarakSaklamaz()
    {
        const string password = "CokGizliParola2026";
        HashingHelper.CreatePasswordHash(password, out var hash, out var salt);

        Assert.DoesNotContain(password, Encoding.UTF8.GetString(hash));
        Assert.DoesNotContain(password, Encoding.UTF8.GetString(salt));
    }

    [Fact]
    public void CreatePasswordHash_YeterinceUzunHashVeSaltUretir()
    {
        HashingHelper.CreatePasswordHash("Admin123!", out var hash, out var salt);

        Assert.True(hash.Length >= 32, $"Hash çok kısa: {hash.Length} bayt");
        Assert.True(salt.Length >= 16, $"Salt çok kısa: {salt.Length} bayt");
    }
}
