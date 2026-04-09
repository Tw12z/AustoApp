using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Finance;
using Austo26.Application.Repositories;
using Austo26.Domain.Finance;

namespace Austo26.Persistence.Services;

public class GoldPriceService : IGoldPriceService
{
    private readonly IGoldPriceLogRepository _repo;

    public GoldPriceService(IGoldPriceLogRepository repo) { _repo = repo; }

    public async Task<GoldPriceLogDto?> GetLatestAsync()
    {
        var log = await _repo.GetLatestAsync();
        return log is null ? null : Map(log);
    }

    public async Task<IEnumerable<GoldPriceLogDto>> GetHistoryAsync(int days = 30)
    {
        var from = DateTime.UtcNow.AddDays(-days);
        var logs = await _repo.GetByDateRangeAsync(from, DateTime.UtcNow);
        return logs.Select(Map);
    }

    public async Task<GoldPriceLog> LogManualPriceAsync(LogGoldPriceRequest request)
    {
        var log = new GoldPriceLog(
            DateTime.UtcNow, request.GramGoldBuyTRY, request.GramGoldSellTRY, "Manuel",
            request.GramK14BuyTRY, request.GramK14SellTRY,
            request.GramK18BuyTRY, request.GramK18SellTRY,
            request.GramK22BuyTRY, request.GramK22SellTRY);

        await _repo.AddAsync(log);
        await _repo.SaveChangesAsync();
        return log;
    }

    private static GoldPriceLogDto Map(GoldPriceLog g)
        => new(g.Id, g.Date, g.GramGoldBuyTRY, g.GramGoldSellTRY,
               g.GramK14BuyTRY, g.GramK14SellTRY,
               g.GramK18BuyTRY, g.GramK18SellTRY,
               g.GramK22BuyTRY, g.GramK22SellTRY, g.Source);
}
