using Austo26.Application.DTOs.Transactions;
using Austo26.Domain.Transactions;

namespace Austo26.Application.Abstractions.Services;

public interface ISaleService
{
    Task<IEnumerable<SaleDto>> GetAllAsync();
    Task<SaleDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<SaleDto>> GetByCustomerAsync(Guid customerId);
    Task<IEnumerable<SaleDto>> GetByDateRangeAsync(DateTime from, DateTime to);
    Task<SaleTransaction> CreateAsync(CreateSaleRequest request);
    Task CancelAsync(Guid id);
}
