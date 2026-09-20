using Austo26.Domain.Products;

namespace Austo26.Application.DTOs.Stock;

// Konum bazlı stok görünümü.
//
// Adet bilgisi iki ayrı yerde tutuluyor: Product.StockQuantity toplam adedi,
// StockItem ise her parçanın tek tek nerede olduğunu tutuyor. Parçası
// oluşturulmamış ürünlerde toplam adet parça sayısından fazla olabiliyor —
// bu fark "konumu belirtilmemiş" olarak ayrı raporlanıyor ki ekrandaki
// dağılım her zaman toplam adede eşitlensin.

/// <summary>Bir ürünün tek bir konumdaki adedi.</summary>
public record ProductLocationQuantityDto(
    Guid? LocationId,          // null = konumu belirtilmemiş parçalar
    string LocationName,
    decimal Quantity,
    decimal TotalWeightGram
);

/// <summary>Bir ürünün konumlara göre dağılımı (Stok sayfası: ürün adına tıklayınca).</summary>
public record ProductLocationBreakdownDto(
    Guid ProductId,
    string ProductName,
    string CategoryName,
    GoldPurity Purity,
    decimal WeightGram,
    decimal TotalQuantity,        // Product.StockQuantity
    decimal AssignedQuantity,     // konumu belli olan parça sayısı
    decimal UnassignedQuantity,   // TotalQuantity - AssignedQuantity (negatifse 0)
    IReadOnlyCollection<ProductLocationQuantityDto> Locations
);

/// <summary>Bir konumdaki tek bir ürünün adedi (Konumlar sayfası: konuma tıklayınca).</summary>
public record LocationProductQuantityDto(
    Guid ProductId,
    string ProductName,
    string CategoryName,
    GoldPurity Purity,
    decimal WeightGram,
    decimal Quantity,
    decimal TotalWeightGram,
    decimal EstimatedValueTRY
);

/// <summary>Bir konumun içindeki tüm ürünler.</summary>
public record LocationStockDetailDto(
    Guid? LocationId,
    string LocationName,
    string? Description,
    decimal TotalQuantity,
    decimal TotalWeightGram,
    decimal TotalEstimatedValueTRY,
    IReadOnlyCollection<LocationProductQuantityDto> Products
);

/// <summary>Konum listesi için özet (Konumlar sayfasındaki adet kolonu).</summary>
public record LocationStockSummaryDto(
    Guid? LocationId,
    string LocationName,
    int DistinctProductCount,
    decimal TotalQuantity,
    decimal TotalWeightGram,
    decimal TotalEstimatedValueTRY
);
