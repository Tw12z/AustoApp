using Austo26.Application.DTOs.Finance;

namespace Austo26.Application.Abstractions.Services;

public interface IFinanceService
{
    Task<List<FinanceItemDto>> GetLiveRatesAsync();
}
