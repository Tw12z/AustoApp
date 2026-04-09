using Austo26.Application.DTOs.Auth;

namespace Austo26.Application.Abstractions.Services;

public interface IAuthService
{
    Task<string?> RegisterAsync(RegisterDto model);   // returns verification token (dev only)
    Task<TokenDto> LoginAsync(LoginDto model);
    Task VerifyEmailAsync(string token);
    Task<string?> ForgotPasswordAsync(string email);  // returns reset token (dev only)
    Task ResetPasswordAsync(ResetPasswordDto model);
}
