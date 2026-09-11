using CyberSoc.Api.Authorization;
using CyberSoc.Api.Configuration;
using CyberSoc.Api.Domain.Enums;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;

namespace CyberSoc.Api.Authentication;

internal static class AuthenticationExtensions
{
    public static IServiceCollection AddSocAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IValidateOptions<JwtOptions>, JwtOptionsValidator>();
        services.AddOptions<JwtOptions>().Bind(configuration.GetSection("Jwt")).ValidateOnStart();
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<IPasswordService, PasswordService>();
        services.AddSingleton<JwtTokenService>();
        services.AddScoped<IAuthUserStore, EfAuthUserStore>();
        services.AddScoped<LoginService>();
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();
        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<IOptions<JwtOptions>>((bearer, jwt) =>
            {
                bearer.MapInboundClaims = false;
                bearer.IncludeErrorDetails = false;
                bearer.SaveToken = false;
                bearer.TokenValidationParameters = jwt.Value.CreateValidationParameters();
                bearer.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken =
                            context.Request.Query["access_token"].ToString();

                        if (!string.IsNullOrWhiteSpace(accessToken) &&
                            context.HttpContext.Request.Path
                                .StartsWithSegments("/hubs/alerts"))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        var principal = context.Principal!;
                        bool Single(string claim) => principal.FindAll(claim).Count() == 1;
                        if (!new[] { "sub", "email", "name", "role", "jti" }.All(Single) ||
                            !Guid.TryParse(principal.FindFirst("sub")?.Value, out var id) || id == Guid.Empty ||
                            !new[] { nameof(UserRole.Admin), nameof(UserRole.SocAnalyst) }.Contains(principal.FindFirst("role")?.Value))
                        {
                            context.Fail("Invalid token identity.");
                        }

                        return Task.CompletedTask;
                    },
                    OnChallenge = async context =>
                    {
                        context.HandleResponse();
                        context.Response.Headers.WWWAuthenticate = "Bearer";
                        await Results.Problem(statusCode: 401, title: "Authentication required").ExecuteAsync(context.HttpContext);
                    },
                    OnForbidden = context => Results.Problem(statusCode: 403, title: "Access denied").ExecuteAsync(context.HttpContext)
                };
            });
        services.AddAuthorizationBuilder()
            .AddPolicy(SocPolicies.AdminOnly, policy => policy.RequireAuthenticatedUser().RequireRole(nameof(UserRole.Admin)))
            .AddPolicy(SocPolicies.SocOperations, policy => policy.RequireAuthenticatedUser().RequireRole(nameof(UserRole.Admin), nameof(UserRole.SocAnalyst)));
        return services;
    }
}
