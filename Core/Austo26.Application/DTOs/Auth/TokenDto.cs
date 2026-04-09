namespace Austo26.Application.DTOs.Auth;

public class TokenDto
{
    public string AccessToken { get; init; }
    public DateTime Expiration { get; init; }
    public string UserName { get; init; }
    public string UserRole { get; init; }
    public string? RefreshToken { get; init; }

    public TokenDto(string accessToken, DateTime expiration, string userName, string userRole, string? refreshToken)
    {
        AccessToken  = accessToken;
        Expiration   = expiration;
        UserName     = userName;
        UserRole     = userRole;
        RefreshToken = refreshToken;
    }

    public static TokenDto Create(string accessToken, DateTime expiration, string userName, string userRole, string? refreshToken)
    {
        if (string.IsNullOrEmpty(accessToken)) throw new ArgumentException("Token boş olamaz.");
        return new TokenDto(accessToken, expiration, userName, userRole, refreshToken);
    }
}
