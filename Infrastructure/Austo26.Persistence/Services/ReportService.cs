using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Reports;
using Austo26.Application.Repositories;
using Austo26.Domain.Transactions;

namespace Austo26.Persistence.Services;

public class ReportService : IReportService
{
    private readonly ISaleTransactionRepository _saleRepo;
    private readonly IPurchaseTransactionRepository _purchaseRepo;
    private readonly IProductRepository _productRepo;

    public ReportService(ISaleTransactionRepository saleRepo,
                         IPurchaseTransactionRepository purchaseRepo,
                         IProductRepository productRepo)
    {
        _saleRepo     = saleRepo;
        _purchaseRepo = purchaseRepo;
        _productRepo  = productRepo;
    }

    public Task<DailySummaryDto> GetDailySummaryAsync(DateTime date)
        => GetRangeSummaryAsync(date, date);

    public async Task<DailySummaryDto> GetRangeSummaryAsync(DateTime from, DateTime to)
    {
        var rangeStart = from.Date;
        var rangeEnd   = to.Date.AddDays(1).AddTicks(-1);

        var allSales  = (await _saleRepo.GetByDateRangeAsync(rangeStart, rangeEnd)).ToList();
        var sales     = allSales.Where(s => s.Status != TransactionStatus.Cancelled).ToList();
        var purchases = (await _purchaseRepo.GetByDateRangeAsync(rangeStart, rangeEnd)).ToList();

        var salesRevenue  = sales.Sum(s => s.TotalAmountTRY);
        var purchasesCost = purchases.Sum(p => p.TotalAmountTRY);

        return new DailySummaryDto(
            rangeStart,
            sales.Count,
            salesRevenue,
            sales.Sum(s => s.TotalWeightGram),
            purchases.Count,
            purchasesCost,
            purchases.Sum(p => p.WeightGram),
            salesRevenue - purchasesCost);
    }

    public async Task<StockReportDto> GetStockReportAsync()
    {
        var products = await _productRepo.GetAllWithDetailsAsync();
        var activeProducts = products.Where(p => p.IsActive && p.StockQuantity > 0).ToList();

        var items = activeProducts.Select(p => new StockReportItemDto(
            p.Name,
            p.CategoryName,
            p.WeightGram,
            p.Purity.ToString(),
            p.StockQuantity,
            p.WeightGram * p.StockQuantity,
            p.SalePrice * p.StockQuantity)).ToList();

        return new StockReportDto(
            DateTime.UtcNow,
            items.Count,
            items.Sum(i => i.TotalWeightGram),
            items.Sum(i => i.EstimatedValueTRY),
            items);
    }
}
