using Austo26.Domain.Entities.Locations;

namespace Austo26.Application.Abstractions.Services;

public interface ILocationService
{
    Task<IEnumerable<Location>> GetAllAsync();
    Task<Location> CreateAsync(string name, string? description);
    Task<Location> UpdateAsync(Guid id, string name, string? description);
    Task DeactivateAsync(Guid id);
}
