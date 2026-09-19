using Austo26.Application.DTOs.DemoRequests;
using Austo26.Domain.DemoRequests;

namespace Austo26.Application.Abstractions.Services;

public interface IDemoRequestService
{
    Task<IEnumerable<DemoRequestDto>> GetAllAsync();
    Task<DemoRequest> CreateAsync(CreateDemoRequestDto request);
    Task UpdateStatusAsync(Guid id, DemoRequestStatus status);
}
