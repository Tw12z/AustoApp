using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.DemoRequests;
using Austo26.Application.Repositories;
using Austo26.Domain.DemoRequests;
using Austo26.Domain.Users;

namespace Austo26.Persistence.Services;

public class DemoRequestService : IDemoRequestService
{
    private readonly IDemoRequestRepository _repo;
    private readonly IUserRepository _userRepo;
    private readonly IMailService _mailService;

    public DemoRequestService(IDemoRequestRepository repo, IUserRepository userRepo, IMailService mailService)
    {
        _repo = repo;
        _userRepo = userRepo;
        _mailService = mailService;
    }

    public async Task<IEnumerable<DemoRequestDto>> GetAllAsync()
        => (await _repo.GetAllAsync()).OrderByDescending(r => r.CreatedAt).Select(Map);

    public async Task<DemoRequest> CreateAsync(CreateDemoRequestDto request)
    {
        var demoRequest = new DemoRequest(request.FullName, request.BusinessName, request.Phone, request.Email, request.Note);
        await _repo.AddAsync(demoRequest);
        await _repo.SaveChangesAsync();

        await NotifyAdminsAsync(demoRequest);

        return demoRequest;
    }

    public async Task UpdateStatusAsync(Guid id, DemoRequestStatus status)
    {
        var demoRequest = await _repo.GetByIdAsync(id) ?? throw new Exception("Demo talebi bulunamadı.");
        demoRequest.ChangeStatus(status);
        await _repo.SaveChangesAsync();
    }

    // Best-effort — a failed notification email must never fail the lead capture itself.
    private async Task NotifyAdminsAsync(DemoRequest request)
    {
        var admins = (await _userRepo.GetAllAsync())
            .Where(u => u.Role == UserRole.Admin && u.IsActive);

        var body = BuildNotificationEmail(request);

        foreach (var admin in admins)
        {
            try { await _mailService.SendEmailAsync(admin.Email, "Austo — Yeni Demo Talebi", body); }
            catch { /* SMTP not configured or unreachable — request is already saved, safe to ignore */ }
        }
    }

    private static string BuildNotificationEmail(DemoRequest r) => $"""
        <!DOCTYPE html>
        <html lang="tr">
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#080808;font-family:'Inter','Helvetica Neue',Arial,sans-serif">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;min-height:100vh">
            <tr><td align="center" style="padding:48px 16px">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:linear-gradient(160deg,#141414 0%,#0E0E0E 100%);border:1px solid rgba(212,175,55,0.12);border-radius:16px;padding:32px">
                <tr><td>
                  <div style="font-size:11px;letter-spacing:3px;color:#D4AF37;text-transform:uppercase;margin-bottom:20px">✦ Yeni Demo Talebi</div>
                  <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#ddd">
                    <tr><td style="padding:6px 0;color:#666">Ad Soyad</td><td style="padding:6px 0;text-align:right">{r.FullName}</td></tr>
                    <tr><td style="padding:6px 0;color:#666">İşletme</td><td style="padding:6px 0;text-align:right">{r.BusinessName}</td></tr>
                    <tr><td style="padding:6px 0;color:#666">Telefon</td><td style="padding:6px 0;text-align:right">{r.Phone}</td></tr>
                    <tr><td style="padding:6px 0;color:#666">E-posta</td><td style="padding:6px 0;text-align:right">{r.Email ?? "—"}</td></tr>
                  </table>
                  {(string.IsNullOrEmpty(r.Note) ? "" : $"""<div style="margin-top:16px;padding:12px;background:#0A0A0A;border-radius:8px;color:#999;font-size:13px">{r.Note}</div>""")}
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body></html>
        """;

    private static DemoRequestDto Map(DemoRequest r)
        => new(r.Id, r.FullName, r.BusinessName, r.Phone, r.Email, r.Note, (int)r.Status, r.CreatedAt);
}
