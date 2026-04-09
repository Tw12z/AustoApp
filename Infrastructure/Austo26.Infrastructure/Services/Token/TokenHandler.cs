using Austo26.Application.Abstractions.Token;
using Austo26.Application.DTOs.Auth;
using Austo26.Domain.Users;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Austo26.Infrastructure.Services.Token;

public class TokenHandler : ITokenHandler
{
    private readonly IConfiguration _configuration;

    public TokenHandler(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public TokenDto CreateAccessToken(int seconds, User user)
    {
        SymmetricSecurityKey securityKey = new(Encoding.UTF8.GetBytes(_configuration["Token:SecurityKey"]!));
        SigningCredentials credentials = new(securityKey, SecurityAlgorithms.HmacSha256);
        DateTime expiration = DateTime.UtcNow.AddSeconds(seconds);

        JwtSecurityToken token = new(
            audience: _configuration["Token:Audience"],
            issuer: _configuration["Token:Issuer"],
            expires: expiration,
            notBefore: DateTime.UtcNow,
            signingCredentials: credentials,
            claims: new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.UserName),
                new(ClaimTypes.Role, user.Role.ToString())
            }
        );

        string accessToken  = new JwtSecurityTokenHandler().WriteToken(token);
        string refreshToken = CreateRefreshToken();

        return TokenDto.Create(accessToken, expiration, user.UserName, user.Role.ToString(), refreshToken);
    }

    public string CreateRefreshToken()
    {
        byte[] number = new byte[32];
        using RandomNumberGenerator rng = RandomNumberGenerator.Create();
        rng.GetBytes(number);
        return Convert.ToBase64String(number);
    }
}
