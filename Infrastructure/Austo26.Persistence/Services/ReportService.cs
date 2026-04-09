using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Reports;
using Austo26.Application.Repositories;

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

    public async Task<DailySummaryDto> GetDailySummaryAsync(DateTime date)
    {
        var dayStart = date.Date;
        var dayEnd   = dayStart.AddDays(1).AddTicks(-1);

        var sales     = (await _saleRepo.GetByDateRangeAsync(dayStart, dayEnd)).ToList();
        var purchases = (await _purchaseRepo.GetByDateRangeAsync(dayStart, dayEnd)).ToList();

        var salesRevenue  = sales.Sum(s => s.TotalAmountTRY);
        var purchasesCost = purchases.Sum(p => p.TotalAmountTRY);

        return new DailySummaryDto(
            date,
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
