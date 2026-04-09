using Austo26.Application.Abstractions.Services;
using Austo26.Application.Abstractions.Token;
using Austo26.Application.Settings;
using Austo26.Infrastructure.Services;
using Austo26.Infrastructure.Services.Finance;
using Austo26.Infrastructure.Services.Token;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Austo26.Infrastructure;

public static class InfrastructureServiceRegistration
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MailSettings>(configuration.GetSection("MailSettings"));

        services.AddTransient<IMailService, MailService>();
        services.AddScoped<ITokenHandler, TokenHandler>();
        services.AddScoped<IQRService, QRService>();
        services.AddHttpClient<IFinanceService, TuruncgilService>();

        return services;
    }
}
