using Austo26.Domain.Transactions;

namespace Austo26.Application.DTOs.Transactions;

public record SaleItemDto(
    Guid ProductId,
    string ProductName,
    decimal Quantity,
    decimal UnitPriceTRY,
    decimal WeightGram
);

public record SaleDto(
    Guid Id,
    string? CustomerName,
    DateTime SaleDate,
    decimal TotalAmountTRY,
    decimal TotalWeightGram,
    TransactionStatus Status,
    string? Notes,
    IReadOnlyCollection<SaleItemDto> Items
);

public record CreateSaleItemRequest(
    Guid ProductId,
    decimal Quantity,
    decimal UnitPriceTRY   // Override fiyat (0 ise ürün fiyatı kullanılır)
);

public record CreateSaleRequest(
    Guid? CustomerId,
    DateTime SaleDate,
    IReadOnlyCollection<CreateSaleItemRequest> Items,
    string? Notes
);
