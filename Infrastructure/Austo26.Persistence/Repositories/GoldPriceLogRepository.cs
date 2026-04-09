using Austo26.Application.Repositories;
using Austo26.Domain.Finance;
using Austo26.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Austo26.Persistence.Repositories;

public class GoldPriceLogRepository : BaseRepository<GoldPriceLog>, IGoldPriceLogRepository
{
    public GoldPriceLogRepository(AppDbContext context) : base(context, context.GoldPriceLogs) { }

    public async Task<GoldPriceLog?> GetLatestAsync()
        => await _dbSet.OrderByDescending(g => g.Date).FirstOrDefaultAsync();

    public async Task<IEnumerable<GoldPriceLog>> GetByDateRangeAsync(DateTime from, DateTime to)
        => await _dbSet.Where(g => g.Date >= from && g.Date <= to).OrderByDescending(g => g.Date).ToListAsync();
}
