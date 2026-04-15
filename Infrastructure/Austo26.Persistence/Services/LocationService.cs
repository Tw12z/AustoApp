using Austo26.Application.Abstractions.Services;
using Austo26.Application.Repositories;
using Austo26.Domain.Entities.Locations;

namespace Austo26.Persistence.Services;

public class LocationService : ILocationService
{
    private readonly ILocationRepository _repo;

    public LocationService(ILocationRepository repo) { _repo = repo; }

    public async Task<IEnumerable<Location>> GetAllAsync() => await _repo.GetAllAsync();

    public async Task<Location> CreateAsync(string name, string? description, Guid? categoryId)
    {
        var location = new Location(name, description, categoryId);
        await _repo.AddAsync(location);
        await _repo.SaveChangesAsync();
        return location;
    }

    public async Task<Location> UpdateAsync(Guid id, string name, string? description, Guid? categoryId)
    {
        var location = await _repo.GetByIdAsync(id) ?? throw new Exception("Konum bulunamadı.");
        location.Rename(name);
        location.ChangeDescription(description);
        location.ChangeCategory(categoryId);
        await _repo.SaveChangesAsync();
        return location;
    }

    public async Task DeactivateAsync(Guid id)
    {
        var location = await _repo.GetByIdAsync(id) ?? throw new Exception("Konum bulunamadı.");
        location.Deactivate();
        await _repo.SaveChangesAsync();
    }
}
