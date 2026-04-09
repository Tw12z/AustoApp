using Austo26.Application.Abstractions.Services;
using Austo26.Application.Abstractions.Token;
using Austo26.Application.DTOs.Auth;
using Austo26.Application.Repositories;
using Austo26.Application.Security;
using Austo26.Domain.Users;
using Microsoft.Extensions.Configuration;

namespace Austo26.Persistence.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly ITokenHandler _tokenHandler;
    private readonly IMailService _mailService;
    private readonly IConfiguration _config;

    public AuthService(IUserRepository userRepo, ITokenHandler tokenHandler,
                       IMailService mailService, IConfiguration config)
    {
        _userRepo     = userRepo;
        _tokenHandler = tokenHandler;
        _mailService  = mailService;
        _config       = config;
    }

    public async Task<string?> RegisterAsync(RegisterDto model)
    {
        if (await _userRepo.IsUserExistsAsync(model.UserName, model.Email))
            throw new Exception("Bu kullanıcı adı veya e-posta zaten kullanılıyor.");

        HashingHelper.CreatePasswordHash(model.Password, out byte[] hash, out byte[] salt);

        var user = new User(model.FullName, model.UserName, model.Email, hash, salt, model.Role);

        var token = Guid.NewGuid().ToString("N");
        user.SetEmailVerificationToken(token, DateTime.UtcNow.AddHours(24));

        await _userRepo.AddAsync(user);
        await _userRepo.SaveChangesAsync();

        var clientUrl = _config["ClientUrl"] ?? "http://localhost:5173";
        var verifyLink = $"{clientUrl}/verify-email?token={token}";

        string? devToken = null;
        try
        {
            await _mailService.SendEmailAsync(
                user.Email,
                "Austo — E-posta Adresinizi Doğrulayın",
                BuildVerificationEmail(user.FullName, verifyLink));
        }
        catch
        {
            // SMTP not configured — return token so dev can verify manually
            devToken = token;
        }

        return devToken;
    }

    public async Task<TokenDto> LoginAsync(LoginDto model)
    {
        var user = await _userRepo.GetByUserNameOrEmailAsync(model.UserNameOrEmail);

        if (user is null || !user.IsActive) throw new Exception("Kullanıcı bulunamadı veya pasif.");
        if (!user.IsEmailVerified) throw new Exception("E-posta adresiniz henüz doğrulanmadı. Lütfen gelen kutunuzu kontrol edin.");
        if (!HashingHelper.VerifyPasswordHash(model.Password, user.PasswordHash, user.PasswordSalt))
            throw new Exception("Şifre hatalı.");

        var token = _tokenHandler.CreateAccessToken(86400, user);
        user.UpdateRefreshToken(_tokenHandler.CreateRefreshToken(), DateTime.UtcNow.AddDays(7));
        await _userRepo.SaveChangesAsync();

        return token;
    }

    public async Task VerifyEmailAsync(string token)
    {
        var user = await _userRepo.GetByEmailVerificationTokenAsync(token)
                   ?? throw new Exception("Geçersiz veya süresi dolmuş doğrulama bağlantısı.");

        if (user.EmailVerificationTokenExpiry < DateTime.UtcNow)
            throw new Exception("Doğrulama bağlantısının süresi dolmuş. Lütfen yeniden kayıt olun.");

        user.VerifyEmail();
        await _userRepo.SaveChangesAsync();
    }

    public async Task<string?> ForgotPasswordAsync(string email)
    {
        var user = await _userRepo.GetByEmailAsync(email);
        if (user is null) return null; // don't reveal whether email exists

        var token = Guid.NewGuid().ToString("N");
        user.SetPasswordResetToken(token, DateTime.UtcNow.AddHours(1));
        await _userRepo.SaveChangesAsync();

        var clientUrl = _config["ClientUrl"] ?? "http://localhost:5173";
        var resetLink = $"{clientUrl}/reset-password?token={token}";

        string? devToken = null;
        try
        {
            await _mailService.SendEmailAsync(
                user.Email,
                "Austo — Şifre Sıfırlama",
                BuildResetEmail(user.FullName, resetLink));
        }
        catch
        {
            devToken = token;
        }

        return devToken;
    }

    public async Task ResetPasswordAsync(ResetPasswordDto model)
    {
        var user = await _userRepo.GetByPasswordResetTokenAsync(model.Token)
                   ?? throw new Exception("Geçersiz veya süresi dolmuş sıfırlama bağlantısı.");

        if (user.PasswordResetTokenExpiry < DateTime.UtcNow)
            throw new Exception("Sıfırlama bağlantısının süresi dolmuş.");

        HashingHelper.CreatePasswordHash(model.NewPassword, out byte[] hash, out byte[] salt);
        user.ResetPassword(hash, salt);
        await _userRepo.SaveChangesAsync();
    }

    // ── Email Templates ────────────────────────────────────────────────────────

    private static string BuildVerificationEmail(string name, string link) => $"""
        <div style="font-family:Inter,sans-serif;background:#0a0a0a;padding:40px;max-width:560px;margin:0 auto;border-radius:12px;border:1px solid rgba(212,175,55,0.2)">
          <div style="text-align:center;margin-bottom:32px">
            <h1 style="color:#D4AF37;font-size:28px;margin:0;letter-spacing:2px">AUSTO</h1>
            <p style="color:#555;font-size:12px;margin:4px 0 0">Kuyumcu Yönetim Sistemi</p>
          </div>
          <h2 style="color:#fff;font-size:20px;margin-bottom:8px">Merhaba, {name}</h2>
          <p style="color:#888;line-height:1.6">Hesabınızı aktifleştirmek için e-posta adresinizi doğrulamanız gerekmektedir.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="{link}" style="display:inline-block;background:linear-gradient(135deg,#bf953f,#fcf6ba 20%,#b38728 40%,#fbf5b7 60%,#aa771c 80%,#bf953f);color:#000;font-weight:700;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px">E-postamı Doğrula</a>
          </div>
          <p style="color:#555;font-size:12px;text-align:center">Bu bağlantı 24 saat geçerlidir. Eğer bu isteği siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>
        </div>
        """;

    private static string BuildResetEmail(string name, string link) => $"""
        <div style="font-family:Inter,sans-serif;background:#0a0a0a;padding:40px;max-width:560px;margin:0 auto;border-radius:12px;border:1px solid rgba(212,175,55,0.2)">
          <div style="text-align:center;margin-bottom:32px">
            <h1 style="color:#D4AF37;font-size:28px;margin:0;letter-spacing:2px">AUSTO</h1>
            <p style="color:#555;font-size:12px;margin:4px 0 0">Kuyumcu Yönetim Sistemi</p>
          </div>
          <h2 style="color:#fff;font-size:20px;margin-bottom:8px">Merhaba, {name}</h2>
          <p style="color:#888;line-height:1.6">Şifrenizi sıfırlamak için aşağıdaki butona tıklayın.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="{link}" style="display:inline-block;background:linear-gradient(135deg,#bf953f,#fcf6ba 20%,#b38728 40%,#fbf5b7 60%,#aa771c 80%,#bf953f);color:#000;font-weight:700;padding:14px 36px;border-radius:50px;text-decoration:none;font-size:15px">Şifremi Sıfırla</a>
          </div>
          <p style="color:#555;font-size:12px;text-align:center">Bu bağlantı 1 saat geçerlidir. Eğer bu isteği siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>
        </div>
        """;
}
