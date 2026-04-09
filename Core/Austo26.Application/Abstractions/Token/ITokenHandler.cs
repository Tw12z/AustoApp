using Austo26.Application.DTOs.Auth;
using Austo26.Domain.Users;

namespace Austo26.Application.Abstractions.Token;

public interface ITokenHandler
{
    TokenDto CreateAccessToken(int seconds, User user);
    string CreateRefreshToken();
}
