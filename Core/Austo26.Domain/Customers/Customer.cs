using Austo26.Domain.Entities.Common;

namespace Austo26.Domain.Customers;

public class Customer : BaseEntity
{
    public string FullName { get; private set; }
    public string Phone { get; private set; }
    public string? Email { get; private set; }
    public string? TaxNumber { get; private set; }   // TC / Vergi No
    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }

    protected Customer() { FullName = null!; Phone = null!; }

    public Customer(string fullName, string phone, string? email = null,
                    string? taxNumber = null, string? notes = null)
    {
        SetFullName(fullName);
        SetPhone(phone);
        Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
        TaxNumber = string.IsNullOrWhiteSpace(taxNumber) ? null : taxNumber.Trim();
        Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
        IsActive = true;
    }

    public void Update(string fullName, string phone, string? email, string? taxNumber, string? notes)
    {
        SetFullName(fullName);
        SetPhone(phone);
        Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
        TaxNumber = string.IsNullOrWhiteSpace(taxNumber) ? null : taxNumber.Trim();
        Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
        Touch();
    }

    public void Deactivate() { IsActive = false; Touch(); }
    public void Activate() { IsActive = true; Touch(); }

    private void SetFullName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName)) throw new ArgumentException("Müşteri adı boş olamaz.", nameof(fullName));
        FullName = fullName.Trim();
    }

    private void SetPhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) throw new ArgumentException("Telefon boş olamaz.", nameof(phone));
        Phone = phone.Trim();
    }
}
