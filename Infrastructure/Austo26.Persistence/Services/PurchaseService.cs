using Austo26.Application.Abstractions.Services;
using Austo26.Application.DTOs.Transactions;
using Austo26.Application.Repositories;
using Austo26.Domain.Transactions;

namespace Austo26.Persistence.Services;

public class PurchaseService : IPurchaseService
{
    private readonly IPurchaseTransactionRepository _repo;

    public PurchaseService(IPurchaseTransactionRepository repo) { _repo = repo; }

    public async Task<IEnumerable<PurchaseDto>> GetAllAsync()
        => (await _repo.GetAllAsync()).Select(MapToDto);

    public async Task<PurchaseDto?> GetByIdAsync(Guid id)
    {
        var p = await _repo.GetByIdAsync(id);
        return p is null ? null : MapToDto(p);
    }

    public async Task<IEnumerable<PurchaseDto>> GetByDateRangeAsync(DateTime from, DateTime to)
        => (await _repo.GetByDateRangeAsync(from, to)).Select(MapToDto);

    public async Task<PurchaseTransaction> CreateAsync(CreatePurchaseRequest request)
    {
        var purchase = new PurchaseTransaction(
            request.PurchaseDate, request.TotalAmountTRY, request.WeightGram,
            request.Purity, request.SourceType, request.SupplierId, request.CustomerId, request.Notes);

        await _repo.AddAsync(purchase);
        await _repo.SaveChangesAsync();
        return purchase;
    }

    public async Task CancelAsync(Guid id)
    {
        var purchase = await _repo.GetByIdAsync(id) ?? throw new Exception("Alış bulunamadı.");
        purchase.Cancel();
        await _repo.SaveChangesAsync();
    }

    private static PurchaseDto MapToDto(PurchaseTransaction p) => new(
        p.Id,
        p.Supplier?.CompanyName,
        p.Customer?.FullName,
        p.PurchaseDate,
        p.TotalAmountTRY,
        p.WeightGram,
        p.Purity,
        p.SourceType,
        p.Status,
        p.Notes
    );
}
