using Austo26.Application.DTOs.Reports;

namespace Austo26.Application.Abstractions.Services;

public interface IReportService
{
    Task<DailySummaryDto> GetDailySummaryAsync(DateTime date);
    Task<DailySummaryDto> GetRangeSummaryAsync(DateTime from, DateTime to);
    Task<StockReportDto> GetStockReportAsync();
}
