using Austo26.Application.Repositories;
using Austo26.Domain.Transactions;
using Austo26.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Austo26.Persistence.Repositories;

public class SaleTransactionRepository : BaseRepository<SaleTransaction>, ISaleTransactionRepository
{
    public SaleTransactionRepository(AppDbContext context) : base(context, context.SaleTransactions) { }

    // SaleService.MapToDto always reads Customer.FullName and Items (with
    // each item's Product) — every listing method needs to load them or the
    // API silently returns null customer names and empty item lists instead
    // of an error, which is much harder to notice.
    private IQueryable<SaleTransaction> WithDetails()
        => _dbSet.Include(s => s.Customer).Include(s => s.Items).ThenInclude(i => i.Product);

    public override async Task<IEnumerable<SaleTransaction>> GetAllAsync()
        => await WithDetails().OrderByDescending(s => s.SaleDate).ToListAsync();

    public async Task<SaleTransaction?> GetByIdWithItemsAsync(Guid id)
        => await WithDetails().FirstOrDefaultAsync(s => s.Id == id);

    public async Task<IEnumerable<SaleTransaction>> GetByCustomerAsync(Guid customerId)
        => await WithDetails().Where(s => s.CustomerId == customerId).OrderByDescending(s => s.SaleDate).ToListAsync();

    public async Task<IEnumerable<SaleTransaction>> GetByDateRangeAsync(DateTime from, DateTime to)
        => await WithDetails().Where(s => s.SaleDate >= from && s.SaleDate <= to).OrderByDescending(s => s.SaleDate).ToListAsync();
}
