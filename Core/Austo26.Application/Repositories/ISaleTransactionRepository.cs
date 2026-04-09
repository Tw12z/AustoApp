using Austo26.Domain.Transactions;

namespace Austo26.Application.Repositories;

public interface ISaleTransactionRepository : IBaseRepository<SaleTransaction>
{
    Task<SaleTransaction?> GetByIdWithItemsAsync(Guid id);
    Task<IEnumerable<SaleTransaction>> GetByCustomerAsync(Guid customerId);
    Task<IEnumerable<SaleTransaction>> GetByDateRangeAsync(DateTime from, DateTime to);
}
