using Austo26.Application.Repositories;
using Austo26.Domain.Entities.Locations;
using Austo26.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Austo26.Persistence.Repositories;

public class LocationRepository : BaseRepository<Location>, ILocationRepository
{
    public LocationRepository(AppDbContext context) : base(context, context.Locations) { }

    public new async Task<IEnumerable<Location>> GetAllAsync() =>
        await _dbSet.Include(l => l.Category).ToListAsync();

    public async Task<Location?> GetByIdAsync(Guid id) =>
        await _dbSet.Include(l => l.Category).FirstOrDefaultAsync(l => l.Id == id);
}
