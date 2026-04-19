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
        <!DOCTYPE html>
        <html lang="tr">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#080808;font-family:'Inter','Helvetica Neue',Arial,sans-serif">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;min-height:100vh">
            <tr><td align="center" style="padding:48px 16px">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

                <!-- HEADER -->
                <tr><td style="text-align:center;padding-bottom:40px">
                  <div style="display:inline-block;border-bottom:1px solid rgba(212,175,55,0.25);padding-bottom:20px;width:100%">
                    <div style="font-size:11px;letter-spacing:6px;color:#D4AF37;text-transform:uppercase;margin-bottom:6px">✦ &nbsp; AUSTO &nbsp; ✦</div>
                    <div style="font-size:11px;letter-spacing:3px;color:#555;text-transform:uppercase">Kuyumcu Yönetim Sistemi</div>
                  </div>
                </td></tr>

                <!-- CARD -->
                <tr><td style="background:linear-gradient(160deg,#141414 0%,#0E0E0E 100%);border:1px solid rgba(212,175,55,0.12);border-radius:16px;padding:40px 40px 32px;position:relative">

                  <!-- Top accent line -->
                  <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#D4AF37,transparent);border-radius:16px 16px 0 0"></div>

                  <h2 style="color:#F5F5F5;font-size:22px;font-weight:700;margin:0 0 8px">Merhaba, {name}</h2>
                  <p style="color:#666;font-size:14px;line-height:1.7;margin:0 0 32px">
                    Austo hesabınız oluşturuldu. Hesabınızı aktifleştirmek için aşağıdaki butona tıklayarak e-posta adresinizi doğrulayın.
                  </p>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:32px">
                    <a href="{link}" style="display:inline-block;background:linear-gradient(135deg,#bf953f 0%,#fcf6ba 25%,#b38728 50%,#fbf5b7 75%,#bf953f 100%);color:#000;font-weight:800;font-size:14px;letter-spacing:1px;text-transform:uppercase;padding:14px 40px;border-radius:50px;text-decoration:none">
                      E-postamı Doğrula
                    </a>
                  </td></tr></table>

                  <!-- Info row -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.05);padding-top:20px"><tr>
                    <td style="color:#444;font-size:12px;line-height:1.6">
                      <span style="color:#D4AF3760">⏱</span>&nbsp; Bu bağlantı <strong style="color:#D4AF37">24 saat</strong> geçerlidir.
                    </td>
                  </tr></table>

                </td></tr>

                <!-- FOOTER -->
                <tr><td style="text-align:center;padding-top:28px">
                  <p style="color:#333;font-size:11px;margin:0 0 6px">Eğer bu isteği siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>
                  <p style="color:#2a2a2a;font-size:11px;margin:0">noreply@austodestek.com &nbsp;·&nbsp; Austo Kuyumcu Yönetim Sistemi</p>
                </td></tr>

              </table>
            </td></tr>
          </table>
        </body></html>
        """;

    private static string BuildResetEmail(string name, string link) => $"""
        <!DOCTYPE html>
        <html lang="tr">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#080808;font-family:'Inter','Helvetica Neue',Arial,sans-serif">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;min-height:100vh">
            <tr><td align="center" style="padding:48px 16px">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

                <!-- HEADER -->
                <tr><td style="text-align:center;padding-bottom:40px">
                  <div style="display:inline-block;border-bottom:1px solid rgba(212,175,55,0.25);padding-bottom:20px;width:100%">
                    <div style="font-size:11px;letter-spacing:6px;color:#D4AF37;text-transform:uppercase;margin-bottom:6px">✦ &nbsp; AUSTO &nbsp; ✦</div>
                    <div style="font-size:11px;letter-spacing:3px;color:#555;text-transform:uppercase">Kuyumcu Yönetim Sistemi</div>
                  </div>
                </td></tr>

                <!-- CARD -->
                <tr><td style="background:linear-gradient(160deg,#141414 0%,#0E0E0E 100%);border:1px solid rgba(212,175,55,0.12);border-radius:16px;padding:40px 40px 32px;position:relative">

                  <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#D4AF37,transparent);border-radius:16px 16px 0 0"></div>

                  <!-- Shield icon area -->
                  <div style="text-align:center;margin-bottom:24px">
                    <div style="display:inline-block;width:52px;height:52px;border-radius:50%;background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);line-height:52px;font-size:22px">🔐</div>
                  </div>

                  <h2 style="color:#F5F5F5;font-size:22px;font-weight:700;margin:0 0 8px;text-align:center">Şifre Sıfırlama</h2>
                  <p style="color:#666;font-size:14px;line-height:1.7;margin:0 0 8px;text-align:center">Merhaba, <strong style="color:#D4AF37">{name}</strong></p>
                  <p style="color:#666;font-size:14px;line-height:1.7;margin:0 0 32px;text-align:center">
                    Austo hesabınız için şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi oluşturmak için aşağıdaki butona tıklayın.
                  </p>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-bottom:32px">
                    <a href="{link}" style="display:inline-block;background:linear-gradient(135deg,#bf953f 0%,#fcf6ba 25%,#b38728 50%,#fbf5b7 75%,#bf953f 100%);color:#000;font-weight:800;font-size:14px;letter-spacing:1px;text-transform:uppercase;padding:14px 40px;border-radius:50px;text-decoration:none">
                      Şifremi Sıfırla
                    </a>
                  </td></tr></table>

                  <!-- Info row -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.05);padding-top:20px"><tr>
                    <td style="color:#444;font-size:12px;line-height:1.6">
                      <span style="color:#D4AF3760">⏱</span>&nbsp; Bu bağlantı <strong style="color:#D4AF37">1 saat</strong> geçerlidir.
                    </td>
                  </tr></table>

                </td></tr>

                <!-- FOOTER -->
                <tr><td style="text-align:center;padding-top:28px">
                  <p style="color:#333;font-size:11px;margin:0 0 6px">Bu isteği siz yapmadıysanız şifreniz değiştirilmemiştir.</p>
                  <p style="color:#2a2a2a;font-size:11px;margin:0">noreply@austodestek.com &nbsp;·&nbsp; Austo Kuyumcu Yönetim Sistemi</p>
                </td></tr>

              </table>
            </td></tr>
          </table>
        </body></html>
        """;
}
