using Austo26.Domain.Products;
using Austo26.Domain.Transactions;

namespace Austo26.Application.DTOs.Transactions;

public record PurchaseDto(
    Guid Id,
    string? SupplierName,
    string? CustomerName,
    DateTime PurchaseDate,
    decimal TotalAmountTRY,
    decimal WeightGram,
    GoldPurity Purity,
    PurchaseSourceType SourceType,
    TransactionStatus Status,
    string? Notes
);

public record CreatePurchaseRequest(
    DateTime PurchaseDate,
    decimal TotalAmountTRY,
    decimal WeightGram,
    GoldPurity Purity,
    PurchaseSourceType SourceType,
    Guid? SupplierId,
    Guid? CustomerId,
    string? Notes
);
