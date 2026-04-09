namespace Austo26.Application.DTOs.Reports;

public record DailySummaryDto(
    DateTime Date,
    int SalesCount,
    decimal SalesRevenueTRY,
    decimal SalesWeightGram,
    int PurchasesCount,
    decimal PurchasesCostTRY,
    decimal PurchasesWeightGram,
    decimal NetRevenueTRY
);

public record StockReportItemDto(
    string ProductName,
    string CategoryName,
    decimal WeightGram,
    string Purity,
    decimal StockQuantity,
    decimal TotalWeightGram,
    decimal EstimatedValueTRY
);

public record StockReportDto(
    DateTime GeneratedAt,
    int TotalProducts,
    decimal TotalWeightGram,
    decimal TotalEstimatedValueTRY,
    IReadOnlyCollection<StockReportItemDto> Items
);
