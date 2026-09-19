namespace Austo26.Application.DTOs.DemoRequests;

public record DemoRequestDto(
    Guid Id,
    string FullName,
    string BusinessName,
    string Phone,
    string? Email,
    string? Note,
    int Status,
    DateTime CreatedAt
);

public record CreateDemoRequestDto(
    string FullName,
    string BusinessName,
    string Phone,
    string? Email,
    string? Note
);

public record UpdateDemoRequestStatusRequest(int Status);
