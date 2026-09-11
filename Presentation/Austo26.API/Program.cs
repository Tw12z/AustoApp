using Austo26.Infrastructure;
using Austo26.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. PERSISTENCE + INFRASTRUCTURE
// ==========================================

builder.Services.AddPersistenceServices(builder.Configuration);
builder.Services.AddInfrastructureServices(builder.Configuration);

// ==========================================
// 2. JWT AUTHENTICATION
// ==========================================

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Token:Issuer"],
            ValidAudience            = builder.Configuration["Token:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Token:SecurityKey"]!))
        };
    });

builder.Services.AddAuthorization();

// ==========================================
// 3. CONTROLLERS + OPENAPI
// ==========================================

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Falls back to the local dev origins when Cors:AllowedOrigins isn't set, so
// `dotnet run` keeps working out of the box; production sets it via
// appsettings.Production.json or the Cors__AllowedOrigins__0 / __1 / ... env vars.
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173", "http://localhost:5174"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// ==========================================
// 4. HTTP PIPELINE
// ==========================================

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}
else
{
    // Dev runs Kestrel on http:// only (no local cert), so this is scoped to
    // non-Development environments to avoid a "can't determine https port"
    // warning on every request during `dotnet run`.
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
