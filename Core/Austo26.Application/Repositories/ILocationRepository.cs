using Austo26.Domain.Entities.Locations;

namespace Austo26.Application.Repositories;

public interface ILocationRepository : IBaseRepository<Location>
{
    Task<Location?> GetByIdAsync(Guid id);
}
