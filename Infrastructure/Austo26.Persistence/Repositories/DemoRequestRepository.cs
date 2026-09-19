using Austo26.Application.Repositories;
using Austo26.Domain.DemoRequests;
using Austo26.Persistence.Contexts;

namespace Austo26.Persistence.Repositories;

public class DemoRequestRepository : BaseRepository<DemoRequest>, IDemoRequestRepository
{
    public DemoRequestRepository(AppDbContext context) : base(context, context.DemoRequests) { }

    public async Task<DemoRequest?> GetByIdAsync(Guid id) => await _dbSet.FindAsync(id);
}
