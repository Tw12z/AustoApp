namespace Austo26.Application.DTOs.Suppliers;

public record SupplierDto(
    Guid Id,
    string CompanyName,
    string? ContactName,
    string Phone,
    string? Email,
    string? TaxNumber,
    bool IsActive
);

public record CreateSupplierRequest(
    string CompanyName,
    string Phone,
    string? ContactName,
    string? Email,
    string? TaxNumber,
    string? Notes
);
