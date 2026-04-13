using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Transactions;
using Austo26.Application.Repositories;
using Austo26.Domain.Stock;
using Austo26.Domain.Transactions;

namespace Austo26.Persistence.Services;

public class SaleService : ISaleService
{
    private readonly ISaleTransactionRepository _saleRepo;
    private readonly IProductRepository _productRepo;
    private readonly IStockMovementRepository _stockRepo;

    public SaleService(ISaleTransactionRepository saleRepo,
                       IProductRepository productRepo,
                       IStockMovementRepository stockRepo)
    {
        _saleRepo    = saleRepo;
        _productRepo = productRepo;
        _stockRepo   = stockRepo;
    }

    public async Task<IEnumerable<SaleDto>> GetAllAsync()
    {
        var sales = await _saleRepo.GetAllAsync();
        return sales.Select(MapToDto);
    }

    public async Task<SaleDto?> GetByIdAsync(Guid id)
    {
        var sale = await _saleRepo.GetByIdWithItemsAsync(id);
        return sale is null ? null : MapToDto(sale);
    }

    public async Task<IEnumerable<SaleDto>> GetByCustomerAsync(Guid customerId)
        => (await _saleRepo.GetByCustomerAsync(customerId)).Select(MapToDto);

    public async Task<IEnumerable<SaleDto>> GetByDateRangeAsync(DateTime from, DateTime to)
        => (await _saleRepo.GetByDateRangeAsync(from, to)).Select(MapToDto);

    public async Task<SaleTransaction> CreateAsync(CreateSaleRequest request)
    {
        var sale = new SaleTransaction(request.CustomerId, request.SaleDate, request.Notes);
        await _saleRepo.AddAsync(sale);

        foreach (var itemReq in request.Items)
        {
            var product = await _productRepo.GetByIdAsync(itemReq.ProductId)
                          ?? throw new Exception($"Ürün bulunamadı: {itemReq.ProductId}");

            var unitPrice = itemReq.UnitPriceTRY > 0 ? itemReq.UnitPriceTRY : product.SalePrice;

            var item = new SaleTransactionItem(sale.Id, product.Id, itemReq.Quantity, unitPrice, product.WeightGram);
            sale.AddItem(item);

            product.DecreaseStock(itemReq.Quantity);

            var movement = new StockMovement(product.Id, itemReq.Quantity, StockMovementType.Sale,
                                             description: $"Satış #{sale.Id}", referenceId: sale.Id);
            await _stockRepo.AddAsync(movement);
        }

        sale.Complete();
        await _saleRepo.SaveChangesAsync();

        return sale;
    }

    public async Task CancelAsync(Guid id)
    {
        var sale = await _saleRepo.GetByIdWithItemsAsync(id) ?? throw new Exception("Satış bulunamadı.");

        foreach (var item in sale.Items)
        {
            var product = await _productRepo.GetByIdAsync(item.ProductId)
                          ?? throw new Exception($"Ürün bulunamadı: {item.ProductId}");
            product.IncreaseStock(item.Quantity);

            var reverseMovement = new StockMovement(
                product.Id, item.Quantity, StockMovementType.Adjustment,
                description: $"Satış İptal #{sale.Id}", referenceId: sale.Id);
            await _stockRepo.AddAsync(reverseMovement);
        }

        sale.Cancel();
        await _saleRepo.SaveChangesAsync();
    }

    private static SaleDto MapToDto(SaleTransaction s) => new(
        s.Id,
        s.Customer?.FullName,
        s.SaleDate,
        s.TotalAmountTRY,
        s.TotalWeightGram,
        s.Status,
        s.Notes,
        s.Items.Select(i => new SaleItemDto(
            i.ProductId,
            i.Product?.Name ?? "",
            i.Quantity,
            i.UnitPriceTRY,
            i.WeightGram)).ToList()
    );
}
