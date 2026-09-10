using Austo26.Application.Abstractions.Services;
using Austo26.Application.Repositories;
using Austo26.Domain.Finance;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Austo26.Infrastructure.Services.Finance;

/// <summary>
/// Keeps GoldPriceLog populated automatically so the daily/weekly/monthly
/// history charts (Finance page) have real data to render instead of
/// depending entirely on someone manually logging a price. Writes at most
/// one entry per calendar day (UTC), pulled from the same live feed the
/// ticker uses (finans.truncgil.com via IFinanceService), tagged with
/// Source="Turuncgil" so it's distinguishable from manual entries.
/// </summary>
public class GoldPriceLoggerHostedService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<GoldPriceLoggerHostedService> _logger;
    private static readonly TimeSpan CheckInterval = TimeSpan.FromHours(6);

    public GoldPriceLoggerHostedService(IServiceProvider serviceProvider, ILogger<GoldPriceLoggerHostedService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await LogOnceIfNeededAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gold price auto-log pass failed; will retry on the next interval.");
            }

            try { await Task.Delay(CheckInterval, stoppingToken); }
            catch (TaskCanceledException) { }
        }
    }

    private async Task LogOnceIfNeededAsync(CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IGoldPriceLogRepository>();

        var latest = await repo.GetLatestAsync();
        if (latest is not null && latest.Date.Date == DateTime.UtcNow.Date)
            return; // already have today's entry — one point per day is enough for daily/weekly/monthly grouping

        var finance = scope.ServiceProvider.GetRequiredService<IFinanceService>();
        var rates = await finance.GetLiveRatesAsync();
        var gram = rates.FirstOrDefault(r => r.Code == "GRAM ALTIN");
        if (gram is null || gram.BuyingPrice <= 0 || gram.SellingPrice <= 0)
        {
            _logger.LogWarning("Gold price auto-log skipped: live feed returned no usable GRAM ALTIN rate.");
            return;
        }

        var log = new GoldPriceLog(DateTime.UtcNow, gram.BuyingPrice, gram.SellingPrice, "Turuncgil");
        await repo.AddAsync(log);
        await repo.SaveChangesAsync();
        _logger.LogInformation("Logged today's gold price: buy {Buy} / sell {Sell}", gram.BuyingPrice, gram.SellingPrice);
    }
}
