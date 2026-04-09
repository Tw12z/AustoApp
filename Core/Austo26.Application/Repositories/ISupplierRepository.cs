using Austo26.Domain.Suppliers;

namespace Austo26.Application.Repositories;

public interface ISupplierRepository : IBaseRepository<Supplier>
{
    Task<Supplier?> GetByIdAsync(Guid id);
}
