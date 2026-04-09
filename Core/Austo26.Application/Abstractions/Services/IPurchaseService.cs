using Austo26.Application.DTOs.Transactions;
using Austo26.Domain.Transactions;

namespace Austo26.Application.Abstractions.Services;

public interface IPurchaseService
{
    Task<IEnumerable<PurchaseDto>> GetAllAsync();
    Task<PurchaseDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<PurchaseDto>> GetByDateRangeAsync(DateTime from, DateTime to);
    Task<PurchaseTransaction> CreateAsync(CreatePurchaseRequest request);
    Task CancelAsync(Guid id);
}
