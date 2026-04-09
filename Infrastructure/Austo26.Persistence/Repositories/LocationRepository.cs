using Austo26.Application.Repositories;
using Austo26.Domain.Entities.Locations;
using Austo26.Persistence.Contexts;

namespace Austo26.Persistence.Repositories;

public class LocationRepository : BaseRepository<Location>, ILocationRepository
{
    public LocationRepository(AppDbContext context) : base(context, context.Locations) { }

    public async Task<Location?> GetByIdAsync(Guid id) => await _dbSet.FindAsync(id);
}
