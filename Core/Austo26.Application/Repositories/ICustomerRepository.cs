using Austo26.Domain.Customers;

namespace Austo26.Application.Repositories;

public interface ICustomerRepository : IBaseRepository<Customer>
{
    Task<Customer?> GetByIdAsync(Guid id);
}
