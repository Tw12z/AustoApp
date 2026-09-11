using Austo26.Application.Repositories;
using Austo26.Domain.Transactions;
using Austo26.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Austo26.Persistence.Repositories;

public class PurchaseTransactionRepository : BaseRepository<PurchaseTransaction>, IPurchaseTransactionRepository
{
    public PurchaseTransactionRepository(AppDbContext context) : base(context, context.PurchaseTransactions) { }

    // Same reasoning as SaleTransactionRepository: PurchaseService.MapToDto
    // reads Supplier.CompanyName / Customer.FullName, so every listing path
    // needs these loaded, not just the by-id lookup.
    private IQueryable<PurchaseTransaction> WithDetails()
        => _dbSet.Include(p => p.Supplier).Include(p => p.Customer);

    public override async Task<IEnumerable<PurchaseTransaction>> GetAllAsync()
        => await WithDetails().OrderByDescending(p => p.PurchaseDate).ToListAsync();

    public async Task<PurchaseTransaction?> GetByIdAsync(Guid id)
        => await WithDetails().FirstOrDefaultAsync(p => p.Id == id);

    public async Task<IEnumerable<PurchaseTransaction>> GetByDateRangeAsync(DateTime from, DateTime to)
        => await WithDetails().Where(p => p.PurchaseDate >= from && p.PurchaseDate <= to)
                       .OrderByDescending(p => p.PurchaseDate).ToListAsync();
}
