using Austo26.Domain.Products;
using Austo26.Domain.Stock;

namespace Austo26.Application.DTOs.Stock;

public record StockMovementDto(
    Guid Id,
    string ProductName,
    string? LocationName,
    string? ToLocationName,
    decimal Quantity,
    StockMovementType Type,
    string? Description,
    DateTime CreatedAt
);

public record StockTransferRequest(
    Guid ProductId,
    Guid FromLocationId,
    Guid ToLocationId,
    decimal Quantity,
    string? Notes
);

public record StockValuationItemDto(
    GoldPurity Purity,
    decimal TotalWeightGram,
    decimal TotalPiecesCount,
    decimal EstimatedValueTRY
);

public record StockValuationDto(
    DateTime CalculatedAt,
    decimal TotalWeightGram,
    decimal TotalEstimatedValueTRY,
    IReadOnlyCollection<StockValuationItemDto> ByPurity
);
