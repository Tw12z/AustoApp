using Austo26.Application.DTOs.Finance;
using Austo26.Domain.Finance;

namespace Austo26.Application.Abstractions.Services;

public interface IGoldPriceService
{
    Task<GoldPriceLogDto?> GetLatestAsync();
    Task<IEnumerable<GoldPriceLogDto>> GetHistoryAsync(int days = 30);
    Task<GoldPriceLog> LogManualPriceAsync(LogGoldPriceRequest request);
}
