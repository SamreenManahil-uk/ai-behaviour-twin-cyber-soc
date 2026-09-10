using CyberSoc.Api.Authentication;
using CyberSoc.Api.Domain.Entities;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace CyberSoc.Api.Tests;

public sealed class AuthTestFactory : WebApplicationFactory<Program>
{
    // Deliberately public test-only material. Never use outside tests/local validation.
    public const string TestKey = "TEST_ONLY_NOT_A_REAL_SIGNING_KEY_0123456789_ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    public const string TestPassword = "TEST_ONLY_fictional_password_123!";
    public FakeAuthUserStore Store { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Issuer"] = "soc-tests",
            ["Jwt:Audience"] = "soc-test-client",
            ["Jwt:SigningKey"] = TestKey,
            ["Jwt:AccessTokenMinutes"] = "15"
        }));
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<IAuthUserStore>();
            services.AddSingleton<IAuthUserStore>(Store);
        });
    }
}

public sealed class FakeAuthUserStore : IAuthUserStore
{
    public User? User { get; set; }
    public bool UpgradeSucceeds { get; set; } = true;
    public int UpgradeCount { get; private set; }
    public string? LastEmail { get; private set; }

    public Task<User?> FindActiveAsync(string normalizedEmail, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        LastEmail = normalizedEmail;
        // Returning inactive users also exercises the service's defense-in-depth check.
        return Task.FromResult(User?.Email == normalizedEmail ? User : null);
    }

    public Task<bool> TryUpgradeHashAsync(User user, string newHash, DateTimeOffset updatedAtUtc, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        UpgradeCount++;
        if (UpgradeSucceeds)
        {
            user.PasswordHash = newHash;
            user.UpdatedAtUtc = updatedAtUtc;
        }
        return Task.FromResult(UpgradeSucceeds);
    }
}
