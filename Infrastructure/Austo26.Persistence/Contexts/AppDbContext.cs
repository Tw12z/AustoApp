using Austo26.Application.Abstractions;
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

namespace Austo26.Persistence.Contexts;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories { get; set; }
    public DbSet<Location> Locations { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<StockMovement> StockMovements { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<GoldPriceLog> GoldPriceLogs { get; set; }
    public DbSet<SaleTransaction> SaleTransactions { get; set; }
    public DbSet<SaleTransactionItem> SaleTransactionItems { get; set; }
    public DbSet<PurchaseTransaction> PurchaseTransactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Decimal precision
        modelBuilder.Entity<Product>(e =>
        {
            e.Property(p => p.WeightGram).HasPrecision(18, 4);
            e.Property(p => p.PurchasePrice).HasPrecision(18, 2);
            e.Property(p => p.SalePrice).HasPrecision(18, 2);
            e.Property(p => p.StockQuantity).HasPrecision(18, 4);
        });

        modelBuilder.Entity<StockMovement>(e =>
        {
            e.Property(s => s.Quantity).HasPrecision(18, 4);
            // StockMovement -> Product (required)
            e.HasOne(s => s.Product).WithMany().HasForeignKey(s => s.ProductId).OnDelete(DeleteBehavior.Restrict);
            // StockMovement -> Location (optional, no cascade to avoid multiple paths)
            e.HasOne(s => s.Location).WithMany().HasForeignKey(s => s.LocationId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(s => s.ToLocation).WithMany().HasForeignKey(s => s.ToLocationId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SaleTransaction>(e =>
        {
            e.Property(s => s.TotalAmountTRY).HasPrecision(18, 2);
            e.Property(s => s.TotalWeightGram).HasPrecision(18, 4);
            e.HasMany(s => s.Items).WithOne(i => i.SaleTransaction).HasForeignKey(i => i.SaleTransactionId);
            e.HasOne(s => s.Customer).WithMany().HasForeignKey(s => s.CustomerId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<SaleTransactionItem>(e =>
        {
            e.Property(i => i.Quantity).HasPrecision(18, 4);
            e.Property(i => i.UnitPriceTRY).HasPrecision(18, 2);
            e.Property(i => i.WeightGram).HasPrecision(18, 4);
            e.HasOne(i => i.Product).WithMany().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PurchaseTransaction>(e =>
        {
            e.Property(p => p.TotalAmountTRY).HasPrecision(18, 2);
            e.Property(p => p.WeightGram).HasPrecision(18, 4);
            e.HasOne(p => p.Supplier).WithMany().HasForeignKey(p => p.SupplierId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(p => p.Customer).WithMany().HasForeignKey(p => p.CustomerId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<GoldPriceLog>(e =>
        {
            e.Property(g => g.GramGoldBuyTRY).HasPrecision(18, 2);
            e.Property(g => g.GramGoldSellTRY).HasPrecision(18, 2);
            e.Property(g => g.GramK14BuyTRY).HasPrecision(18, 2);
            e.Property(g => g.GramK14SellTRY).HasPrecision(18, 2);
            e.Property(g => g.GramK18BuyTRY).HasPrecision(18, 2);
            e.Property(g => g.GramK18SellTRY).HasPrecision(18, 2);
            e.Property(g => g.GramK22BuyTRY).HasPrecision(18, 2);
            e.Property(g => g.GramK22SellTRY).HasPrecision(18, 2);
        });

        base.OnModelCreating(modelBuilder);
    }
}
