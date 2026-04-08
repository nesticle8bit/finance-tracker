using Finance.Tracker.Contracts.Manager;
using Finance.Tracker.Repository;
using Finance.Tracker.Repository.RepositoryManager;
using Finance.Tracker.Repository.Seed;
using Finance.Tracker.Service.Contracts.Manager;
using Finance.Tracker.Service.Manager;
using Finance.Tracker.Shared.Transversal;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace Finance.Tracker.API.Extensions
{
    public static class ServiceExtensions
    {
        public static void ConfigureCors(this IServiceCollection services, ConfigurationManager configuration) => services.AddCors(options =>
        {
            string[]? origins = configuration.GetSection("AllowedOrigins")?.Value?.Split(";").Where(x => !string.IsNullOrEmpty(x)).ToArray();

            options.AddPolicy("FINANCE_TRACKER_CORS", builder =>
                builder
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .WithOrigins(origins ?? []));
        });

        public static void ConfigureRepositoryManager(this IServiceCollection services) =>
            services.AddScoped<IRepositoryManager, RepositoryManager>();

        public static void ConfigureServiceManager(this IServiceCollection services) =>
            services.AddScoped<IServiceManager, ServiceManager>();

        public static void ConfigurePostgresContext(this IServiceCollection services, IConfiguration configuration) =>
            services.AddDbContext<RepositoryContext>(opts => opts.UseNpgsql(configuration.GetConnectionString("Default")));

        public static void ConfigureTransversalValue(this IServiceCollection services)
        {
            services.AddHttpContextAccessor();
            services.AddScoped<IAppPrincipal>(provider =>
            {
                var http = provider.GetRequiredService<IHttpContextAccessor>().HttpContext;
                var user = http?.User;

                var id = user?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? "";
                var email = user?.FindFirst(JwtRegisteredClaimNames.Email)?.Value ?? "";
                var name = user?.FindFirst(JwtRegisteredClaimNames.Name)?.Value ?? "";
                var ip = http?.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
                var jwt = http?.Request.Headers.Authorization.ToString().Replace("Bearer ", "") ?? "";

                return new AppPrincipal(id, name, email, ip, jwt);
            });
        }

        public static void ConfigureJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.MapInboundClaims = false;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = configuration["Jwt:Issuer"],
                        ValidAudience = configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(configuration["Jwt:Secret"]!))
                    };
                });
        }

        public static void ConfigureDbSeed(this IServiceCollection services) =>
            services.AddScoped<SeedService>();
    }
}
