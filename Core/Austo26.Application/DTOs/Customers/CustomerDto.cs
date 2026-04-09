namespace Austo26.Application.DTOs.Customers;

public record CustomerDto(
    Guid Id,
    string FullName,
    string Phone,
    string? Email,
    string? TaxNumber,
    string? Notes,
    bool IsActive
);

public record CreateCustomerRequest(
    string FullName,
    string Phone,
    string? Email,
    string? TaxNumber,
    string? Notes
);
