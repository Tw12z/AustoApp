using Austo26.Domain.Entities.Common;

namespace Austo26.Domain.Suppliers;

public class Supplier : BaseEntity
{
    public string CompanyName { get; private set; }
    public string? ContactName { get; private set; }
    public string Phone { get; private set; }
    public string? Email { get; private set; }
    public string? TaxNumber { get; private set; }
    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }

    protected Supplier() { CompanyName = null!; Phone = null!; }

    public Supplier(string companyName, string phone, string? contactName = null,
                    string? email = null, string? taxNumber = null, string? notes = null)
    {
        SetCompanyName(companyName);
        SetPhone(phone);
        ContactName = string.IsNullOrWhiteSpace(contactName) ? null : contactName.Trim();
        Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
        TaxNumber = string.IsNullOrWhiteSpace(taxNumber) ? null : taxNumber.Trim();
        Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
        IsActive = true;
    }

    public void Update(string companyName, string phone, string? contactName, string? email,
                       string? taxNumber, string? notes)
    {
        SetCompanyName(companyName);
        SetPhone(phone);
        ContactName = string.IsNullOrWhiteSpace(contactName) ? null : contactName.Trim();
        Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
        TaxNumber = string.IsNullOrWhiteSpace(taxNumber) ? null : taxNumber.Trim();
        Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
        Touch();
    }

    public void Deactivate() { IsActive = false; Touch(); }
    public void Activate() { IsActive = true; Touch(); }

    private void SetCompanyName(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Tedarikçi adı boş olamaz.", nameof(name));
        CompanyName = name.Trim();
    }

    private void SetPhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) throw new ArgumentException("Telefon boş olamaz.", nameof(phone));
        Phone = phone.Trim();
    }
}
