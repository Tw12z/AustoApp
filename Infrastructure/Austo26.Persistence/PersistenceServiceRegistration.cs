using Austo26.Application.Abstractions;
using Austo26.Application.Abstractions.Services;
using Austo26.Application.Repositories;
using Austo26.Persistence.Contexts;
using Austo26.Persistence.Repositories;
using Austo26.Persistence.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Austo26.Persistence;

public static class PersistenceServiceRegistration
{
    public static IServiceCollection AddPersistenceServices(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        // Repositories
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<ILocationRepository, LocationRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<ISupplierRepository, SupplierRepository>();
        services.AddScoped<IGoldPriceLogRepository, GoldPriceLogRepository>();
        services.AddScoped<ISaleTransactionRepository, SaleTransactionRepository>();
        services.AddScoped<IPurchaseTransactionRepository, PurchaseTransactionRepository>();
        services.AddScoped<IStockMovementRepository, StockMovementRepository>();

        // Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<ILocationService, LocationService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<ISupplierService, SupplierService>();
        services.AddScoped<IGoldPriceService, GoldPriceService>();
        services.AddScoped<ISaleService, SaleService>();
        services.AddScoped<IPurchaseService, PurchaseService>();
        services.AddScoped<IStockService, StockService>();
        services.AddScoped<IReportService, ReportService>();

        return services;
    }
}
