using Austo26.Application.Repositories;
using Austo26.Domain.Customers;
using Austo26.Persistence.Contexts;

namespace Austo26.Persistence.Repositories;

public class CustomerRepository : BaseRepository<Customer>, ICustomerRepository
{
    public CustomerRepository(AppDbContext context) : base(context, context.Customers) { }

    public async Task<Customer?> GetByIdAsync(Guid id) => await _dbSet.FindAsync(id);
}
