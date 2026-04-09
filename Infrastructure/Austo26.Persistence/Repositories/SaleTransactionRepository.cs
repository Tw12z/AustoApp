using Austo26.Application.Repositories;
using Austo26.Domain.Transactions;
using Austo26.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Austo26.Persistence.Repositories;

public class SaleTransactionRepository : BaseRepository<SaleTransaction>, ISaleTransactionRepository
{
    public SaleTransactionRepository(AppDbContext context) : base(context, context.SaleTransactions) { }

    public async Task<SaleTransaction?> GetByIdWithItemsAsync(Guid id)
        => await _dbSet
            .Include(s => s.Customer)
            .Include(s => s.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<IEnumerable<SaleTransaction>> GetByCustomerAsync(Guid customerId)
        => await _dbSet.Where(s => s.CustomerId == customerId).OrderByDescending(s => s.SaleDate).ToListAsync();

    public async Task<IEnumerable<SaleTransaction>> GetByDateRangeAsync(DateTime from, DateTime to)
        => await _dbSet.Where(s => s.SaleDate >= from && s.SaleDate <= to).OrderByDescending(s => s.SaleDate).ToListAsync();
}
