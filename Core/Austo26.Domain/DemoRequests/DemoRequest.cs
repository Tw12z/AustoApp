using Austo26.Domain.Entities.Common;

namespace Austo26.Domain.DemoRequests;

public enum DemoRequestStatus { New = 1, Contacted = 2, Converted = 3, Declined = 4 }

/// <summary>
/// A lead captured from the public "Demo Talep Et" form (registration is
/// closed until the virtual POS / billing integration ships — see landing
/// page). An admin reviews these and manually provisions an account.
/// </summary>
public class DemoRequest : BaseEntity
{
    public string FullName { get; private set; }
    public string BusinessName { get; private set; }
    public string Phone { get; private set; }
    public string? Email { get; private set; }
    public string? Note { get; private set; }
    public DemoRequestStatus Status { get; private set; }

    protected DemoRequest()
    {
        FullName = null!;
        BusinessName = null!;
        Phone = null!;
    }

    public DemoRequest(string fullName, string businessName, string phone, string? email = null, string? note = null)
    {
        SetFullName(fullName);
        SetBusinessName(businessName);
        SetPhone(phone);
        Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
        Note = string.IsNullOrWhiteSpace(note) ? null : note.Trim();
        Status = DemoRequestStatus.New;
    }

    public void ChangeStatus(DemoRequestStatus status)
    {
        Status = status;
        Touch();
    }

    private void SetFullName(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Ad Soyad boş olamaz.", nameof(name));
        FullName = name.Trim();
    }

    private void SetBusinessName(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("İşletme adı boş olamaz.", nameof(name));
        BusinessName = name.Trim();
    }

    private void SetPhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) throw new ArgumentException("Telefon boş olamaz.", nameof(phone));
        Phone = phone.Trim();
    }
}
