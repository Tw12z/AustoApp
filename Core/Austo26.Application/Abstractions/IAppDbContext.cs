using Austo26.Domain.Categories;
using Austo26.Domain.Customers;
using Austo26.Domain.Entities.Locations;
using Austo26.Domain.Finance;
using Austo26.Domain.Products;
using Austo26.Domain.Stock;
using Austo26.Domain.Suppliers;
using Austo26.Domain.Transactions;
using Austo26.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace Austo26.Application.Abstractions;

public interface IAppDbContext
{
    DbSet<Category> Categories { get; }
    DbSet<Location> Locations { get; }
    DbSet<Product> Products { get; }
    DbSet<StockMovement> StockMovements { get; }
    DbSet<User> Users { get; }
    DbSet<Customer> Customers { get; }
    DbSet<Supplier> Suppliers { get; }
    DbSet<GoldPriceLog> GoldPriceLogs { get; }
    DbSet<SaleTransaction> SaleTransactions { get; }
    DbSet<SaleTransactionItem> SaleTransactionItems { get; }
    DbSet<PurchaseTransaction> PurchaseTransactions { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
