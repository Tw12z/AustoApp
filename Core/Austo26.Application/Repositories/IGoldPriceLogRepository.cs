using Austo26.Domain.Finance;

namespace Austo26.Application.Repositories;

public interface IGoldPriceLogRepository : IBaseRepository<GoldPriceLog>
{
    Task<GoldPriceLog?> GetLatestAsync();
    Task<IEnumerable<GoldPriceLog>> GetByDateRangeAsync(DateTime from, DateTime to);
}
