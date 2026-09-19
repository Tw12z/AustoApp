using Austo26.Domain.DemoRequests;

namespace Austo26.Application.Repositories;

public interface IDemoRequestRepository : IBaseRepository<DemoRequest>
{
    Task<DemoRequest?> GetByIdAsync(Guid id);
}
