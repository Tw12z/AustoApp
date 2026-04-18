using Austo26.Domain.Products;
using Austo26.Domain.Stock;

namespace Austo26.Application.DTOs.Stock;

public record StockItemDto(
    Guid Id,
    string ItemCode,
    Guid ProductId,
    string ProductName,
    GoldPurity Purity,
    decimal WeightGram,
    Guid? LocationId,
    string? LocationName,
    StockItemStatus Status,
    Guid? PurchaseTransactionId,
    string? Notes,
    DateTime CreatedAt
);

public record CreateStockItemBatchRequest(
    Guid ProductId,
    int Count,            // kaç parça oluşturulsun
    Guid? LocationId,
    Guid? PurchaseTransactionId,
    string? Notes
);

public record StockItemTransferRequest(
    Guid ToLocationId,
    string? Notes
);

public record StockItemDamageRequest(
    string Reason,   // "Damaged" | "Lost"
    string? Notes
);
