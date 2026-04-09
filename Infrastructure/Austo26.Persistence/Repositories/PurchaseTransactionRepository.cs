using Austo26.Application.Repositories;
using Austo26.Domain.Transactions;
using Austo26.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Austo26.Persistence.Repositories;

public class PurchaseTransactionRepository : BaseRepository<PurchaseTransaction>, IPurchaseTransactionRepository
{
    public PurchaseTransactionRepository(AppDbContext context) : base(context, context.PurchaseTransactions) { }

    public async Task<PurchaseTransaction?> GetByIdAsync(Guid id)
        => await _dbSet.Include(p => p.Supplier).Include(p => p.Customer).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<IEnumerable<PurchaseTransaction>> GetByDateRangeAsync(DateTime from, DateTime to)
        => await _dbSet.Where(p => p.PurchaseDate >= from && p.PurchaseDate <= to)
                       .OrderByDescending(p => p.PurchaseDate).ToListAsync();
}
