using Austo26.Domain.Transactions;

namespace Austo26.Application.Repositories;

public interface IPurchaseTransactionRepository : IBaseRepository<PurchaseTransaction>
{
    Task<PurchaseTransaction?> GetByIdAsync(Guid id);
    Task<IEnumerable<PurchaseTransaction>> GetByDateRangeAsync(DateTime from, DateTime to);
}
