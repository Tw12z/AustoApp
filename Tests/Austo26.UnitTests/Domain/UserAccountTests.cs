using Austo26.Domain.Users;

namespace Austo26.UnitTests.Domain;

/// <summary>
/// Kullanıcı hesabının güvenlikle ilgili durumu: e-posta doğrulama ve parola
/// sıfırlama jetonlarının kullanıldıktan sonra temizlenmesi. Jeton geride
/// kalırsa aynı bağlantı ikinci kez kullanılabilir hale gelir.
/// </summary>
public class UserAccountTests
{
    private static User CreateUser(UserRole role = UserRole.Staff) =>
        new("  İlya Cem  ", "  ilyacem  ", "  ilya@example.com  ", [1, 2, 3], [4, 5, 6], role);

    [Fact]
    public void Yeni_Kullanici_AktifAmaEpostasiDogrulanmamisBaslar()
    {
        var user = CreateUser();

        Assert.True(user.IsActive);
        Assert.False(user.IsEmailVerified);
        Assert.Equal(UserRole.Staff, user.Role);
    }

    [Fact]
    public void Yeni_Kullanici_AdEpostaVeKullaniciAdindakiBosluklariKirpar()
    {
        var user = CreateUser();

        Assert.Equal("İlya Cem", user.FullName);
        Assert.Equal("ilyacem", user.UserName);
        Assert.Equal("ilya@example.com", user.Email);
    }

    [Theory]
    [InlineData("", "kullanici", "mail@example.com")]
    [InlineData("Ad Soyad", "  ", "mail@example.com")]
    [InlineData("Ad Soyad", "kullanici", "")]
    public void Yeni_Kullanici_BosAlanlariReddeder(string fullName, string userName, string email)
    {
        Assert.Throws<ArgumentException>(() =>
            new User(fullName, userName, email, [1], [2], UserRole.Staff));
    }

    [Fact]
    public void VerifyEmail_DogrulamaJetonunuTemizler()
    {
        var user = CreateUser();
        user.SetEmailVerificationToken("jeton", DateTime.UtcNow.AddHours(1));

        user.VerifyEmail();

        Assert.True(user.IsEmailVerified);
        Assert.Null(user.EmailVerificationToken);
        Assert.Null(user.EmailVerificationTokenExpiry);
    }

    [Fact]
    public void ResetPassword_YeniParolayiYazarVeSifirlamaJetonunuTemizler()
    {
        var user = CreateUser();
        user.SetPasswordResetToken("sifirlama-jetonu", DateTime.UtcNow.AddMinutes(30));

        user.ResetPassword([9, 9, 9], [8, 8, 8]);

        Assert.Equal([9, 9, 9], user.PasswordHash);
        Assert.Equal([8, 8, 8], user.PasswordSalt);
        Assert.Null(user.PasswordResetToken);
        Assert.Null(user.PasswordResetTokenExpiry);
    }

    [Fact]
    public void Deactivate_HesabiPasifeAlir()
    {
        var user = CreateUser();

        user.Deactivate();

        Assert.False(user.IsActive);
    }

    [Fact]
    public void ChangeRole_RoluDegistirir()
    {
        var user = CreateUser();

        user.ChangeRole(UserRole.Admin);

        Assert.Equal(UserRole.Admin, user.Role);
    }

    [Fact]
    public void RecordTermsAcceptance_OnayIziniSaklar()
    {
        var user = CreateUser();
        var acceptedAt = new DateTime(2026, 9, 20, 12, 0, 0, DateTimeKind.Utc);

        user.RecordTermsAcceptance("2026-09", acceptedAt);

        Assert.Equal("2026-09", user.TermsVersion);
        Assert.Equal(acceptedAt, user.TermsAcceptedAt);
    }

    [Fact]
    public void UpdateRefreshToken_JetonuVeBitisTarihiniSaklar()
    {
        var user = CreateUser();
        var bitis = DateTime.UtcNow.AddDays(7);

        user.UpdateRefreshToken("yenileme-jetonu", bitis);

        Assert.Equal("yenileme-jetonu", user.RefreshToken);
        Assert.Equal(bitis, user.RefreshTokenEndDate);
    }
}
