using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Austo26.Domain.Users;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using AustoTokenHandler = Austo26.Infrastructure.Services.Token.TokenHandler;

namespace Austo26.UnitTests.Security;

/// <summary>
/// Erişim jetonu (JWT) üretimi. Jetonun içindeki rol ve kullanıcı bilgisi ile
/// imzanın doğruluğu, yetkilendirmenin dayandığı tek şey; burada bir regresyon
/// olursa herkes herkesin yetkisiyle işlem yapabilir.
/// </summary>
public class TokenHandlerTests
{
    private const string SecurityKey = "austo-test-imza-anahtari-en-az-256-bit-olmali-1234567890";
    private const string Issuer = "austo-test-issuer";
    private const string Audience = "austo-test-audience";

    private static AustoTokenHandler CreateHandler()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Token:SecurityKey"] = SecurityKey,
                ["Token:Issuer"] = Issuer,
                ["Token:Audience"] = Audience
            })
            .Build();

        return new AustoTokenHandler(configuration);
    }

    private static User CreateUser(UserRole role = UserRole.Staff) =>
        new("İlya Cem", "ilyacem", "ilya@example.com", [1, 2, 3], [4, 5, 6], role);

    [Theory]
    [InlineData(UserRole.Admin)]
    [InlineData(UserRole.Staff)]
    public void CreateAccessToken_KullaniciVeRolBilgisiniJetonaYazar(UserRole role)
    {
        var user = CreateUser(role);

        var token = CreateHandler().CreateAccessToken(900, user);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token.AccessToken);

        Assert.Equal(user.Id.ToString(), jwt.Claims.Single(c => c.Type == ClaimTypes.NameIdentifier).Value);
        Assert.Equal(user.UserName, jwt.Claims.Single(c => c.Type == ClaimTypes.Name).Value);
        Assert.Equal(role.ToString(), jwt.Claims.Single(c => c.Type == ClaimTypes.Role).Value);
        Assert.Equal(role.ToString(), token.UserRole);
        Assert.Equal(user.UserName, token.UserName);
    }

    [Fact]
    public void CreateAccessToken_IstenenSureKadarGecerliBirJetonUretir()
    {
        var beklenen = DateTime.UtcNow.AddSeconds(900);

        var token = CreateHandler().CreateAccessToken(900, CreateUser());

        Assert.True(Math.Abs((token.Expiration - beklenen).TotalSeconds) < 30,
            $"Jeton bitiş zamanı beklenenden uzak: {token.Expiration:O}");
        Assert.True(token.Expiration > DateTime.UtcNow);
    }

    [Fact]
    public void CreateAccessToken_YapilandirilanAnahtarlaDogrulanabilir()
    {
        var token = CreateHandler().CreateAccessToken(900, CreateUser(UserRole.Admin));

        var principal = new JwtSecurityTokenHandler().ValidateToken(
            token.AccessToken,
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = Issuer,
                ValidAudience = Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecurityKey)),
                ClockSkew = TimeSpan.Zero
            },
            out _);

        Assert.Equal(UserRole.Admin.ToString(), principal.FindFirst(ClaimTypes.Role)?.Value);
    }

    [Fact]
    public void CreateAccessToken_BaskaBirAnahtarlaDogrulanamaz()
    {
        // İmza gerçekten doğrulanıyor mu? Farklı anahtarla üretilmiş bir jeton
        // kabul edilirse, isteyen kendi jetonunu üretip admin olabilir.
        var token = CreateHandler().CreateAccessToken(900, CreateUser(UserRole.Admin));
        var sahteAnahtar = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes("baska-bir-imza-anahtari-en-az-256-bit-uzunlugunda-0987654321"));

        Assert.ThrowsAny<SecurityTokenException>(() =>
            new JwtSecurityTokenHandler().ValidateToken(
                token.AccessToken,
                new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = false,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = sahteAnahtar
                },
                out _));
    }

    [Fact]
    public void CreateRefreshToken_HerCagriIcinTahminEdilemezVeFarkliDegerUretir()
    {
        var handler = CreateHandler();

        var tokens = Enumerable.Range(0, 50).Select(_ => handler.CreateRefreshToken()).ToList();

        Assert.Equal(50, tokens.Distinct().Count());
        Assert.All(tokens, t => Assert.True(Convert.FromBase64String(t).Length >= 32));
    }
}
