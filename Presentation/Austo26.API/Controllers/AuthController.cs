using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Austo26.API.Controllers;

// Public by necessity — these are the endpoints a caller hits *before* they
// have a token, so they opt out of the global "authenticated by default"
// fallback policy. Each one is still gated on its own secret (credentials, a
// verification token, a reset token) rather than on being logged in.
[Route("api/[controller]")]
[ApiController]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) { _authService = authService; }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        try
        {
            var devToken = await _authService.RegisterAsync(request);
            var response = new { message = "Kayıt başarılı. Lütfen e-posta adresinizi doğrulayın." };
            // In development, include token so it can be tested without SMTP
            if (devToken is not null)
                return Ok(new { response.message, devVerifyToken = devToken });
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto request)
    {
        try
        {
            var token = await _authService.LoginAsync(request);
            return Ok(token);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token)
    {
        try
        {
            await _authService.VerifyEmailAsync(token);
            return Ok(new { message = "E-posta başarıyla doğrulandı. Artık giriş yapabilirsiniz." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
    {
        try
        {
            var devToken = await _authService.ForgotPasswordAsync(request.Email);
            var response = new { message = "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." };
            if (devToken is not null)
                return Ok(new { response.message, devResetToken = devToken });
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
    {
        try
        {
            await _authService.ResetPasswordAsync(request);
            return Ok(new { message = "Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
