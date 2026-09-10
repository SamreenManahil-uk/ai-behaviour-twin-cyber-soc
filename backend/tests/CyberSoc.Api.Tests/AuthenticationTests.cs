using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using CyberSoc.Api.Authentication;
using CyberSoc.Api.Authorization;
using CyberSoc.Api.Configuration;
using CyberSoc.Api.Contracts.Auth;
using CyberSoc.Api.Domain.Entities;
using CyberSoc.Api.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CyberSoc.Api.Tests;

public sealed class AuthenticationTests
{
    private static User MakeUser(UserRole role = UserRole.SocAnalyst) => new()
    {
        Id = Guid.Parse("a4000000-0000-4000-8000-000000000001"),
        Email = "analyst@example.invalid",
        DisplayName = "Fictional analyst",
        Role = role,
        IsActive = true,
        PasswordHash = ""
    };

    private static JwtOptions Settings() => new()
    {
        Issuer = "soc-tests",
        Audience = "soc-test-client",
        SigningKey = AuthTestFactory.TestKey,
        AccessTokenMinutes = 15
    };

    [Fact]
    public void PasswordHasher_SaltsAndVerifiesWithoutPlaintextStorage()
    {
        var service = new PasswordService();
        var user = MakeUser();
        user.PasswordHash = service.Hash(user, AuthTestFactory.TestPassword);
        Assert.False(user.PasswordHash == AuthTestFactory.TestPassword);
        Assert.False(user.PasswordHash == service.Hash(user, AuthTestFactory.TestPassword));
        Assert.Equal(PasswordVerificationResult.Success, service.Verify(user, AuthTestFactory.TestPassword));
        Assert.Equal(PasswordVerificationResult.Failed, service.Verify(user, "TEST_ONLY_wrong"));
        user.PasswordHash = "invalid-base64";
        Assert.Equal(PasswordVerificationResult.Failed, service.Verify(user, AuthTestFactory.TestPassword));
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Login_UpgradesOldHashesAndRejectsConcurrentChanges(bool upgradeSucceeds)
    {
        var user = MakeUser();
        var legacy = new PasswordHasher<User>(Options.Create(new PasswordHasherOptions { CompatibilityMode = PasswordHasherCompatibilityMode.IdentityV2 }));
        user.PasswordHash = legacy.HashPassword(user, AuthTestFactory.TestPassword);
        var passwords = new PasswordService();
        Assert.Equal(PasswordVerificationResult.SuccessRehashNeeded, passwords.Verify(user, AuthTestFactory.TestPassword));
        var store = new FakeAuthUserStore { User = user, UpgradeSucceeds = upgradeSucceeds };
        var service = new LoginService(store, passwords, new JwtTokenService(Options.Create(Settings()), TimeProvider.System), TimeProvider.System);
        var response = await service.LoginAsync(new LoginRequest { Email = " analyst@example.invalid ", Password = AuthTestFactory.TestPassword }, CancellationToken.None);
        Assert.Equal(upgradeSucceeds, response is not null);
        Assert.Equal(1, store.UpgradeCount);
        Assert.Equal("ANALYST@EXAMPLE.INVALID", store.LastEmail);
        if (upgradeSucceeds)
        {
            Assert.Equal(PasswordVerificationResult.Success, passwords.Verify(user, AuthTestFactory.TestPassword));
            Assert.Equal(TimeSpan.Zero, user.UpdatedAtUtc.Offset);
        }
    }

    [Fact]
    public void Token_ContainsOnlyExpectedClaimsAndConfiguredUtcExpiration()
    {
        var now = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
        var user = MakeUser();
        var response = new JwtTokenService(Options.Create(Settings()), new FixedClock(now)).Issue(user);
        var token = new JwtSecurityTokenHandler().ReadJwtToken(response.AccessToken);
        Assert.Equal(new[] { "aud", "email", "exp", "iss", "jti", "name", "nbf", "role", "sub" }, token.Claims.Select(c => c.Type).Order());
        Assert.True(token.Claims.Single(c => c.Type == "sub").Value == user.Id.ToString());
        Assert.True(token.Claims.Single(c => c.Type == "email").Value == user.Email);
        Assert.True(token.Claims.Single(c => c.Type == "name").Value == user.DisplayName);
        Assert.True(token.Claims.Single(c => c.Type == "role").Value == nameof(UserRole.SocAnalyst));
        Assert.True(Guid.TryParse(token.Claims.Single(c => c.Type == "jti").Value, out _));
        Assert.Equal(now.AddMinutes(15), response.ExpiresAtUtc);
        Assert.Equal(TimeSpan.Zero, response.ExpiresAtUtc.Offset);
        Assert.False(token.RawPayload.Contains(AuthTestFactory.TestPassword, StringComparison.Ordinal));
        var payload = token.Payload.SerializeToJson();
        Assert.False(payload.Contains(AuthTestFactory.TestKey, StringComparison.Ordinal));
        Assert.False(payload.Contains("password", StringComparison.OrdinalIgnoreCase));
        Assert.Equal(SecurityAlgorithms.HmacSha256, token.Header.Alg);
    }

    [Theory]
    [InlineData("issuer")]
    [InlineData("audience")]
    [InlineData("signature")]
    [InlineData("expired")]
    [InlineData("future")]
    [InlineData("algorithm")]
    [InlineData("unsigned")]
    public async Task Me_RejectsInvalidTokens(string defect)
    {
        using var factory = new AuthTestFactory();
        using var client = factory.CreateClient();
        var settings = Settings();
        var now = DateTime.UtcNow;
        var key = defect == "signature" ? new string('T', 64) : settings.SigningKey;
        var credentials = defect == "unsigned" ? null : new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            defect == "algorithm" ? SecurityAlgorithms.HmacSha384 : SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(defect == "issuer" ? "wrong" : settings.Issuer,
            defect == "audience" ? "wrong" : settings.Audience,
            [new Claim("sub", MakeUser().Id.ToString()), new Claim("email", "analyst@example.invalid"),
             new Claim("name", "Test"), new Claim("role", "Admin"), new Claim("jti", Guid.NewGuid().ToString())],
            defect == "future" ? now.AddMinutes(5) : now.AddMinutes(-20),
            defect == "expired" ? now.AddMinutes(-1) : now.AddMinutes(15), credentials);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", new JwtSecurityTokenHandler().WriteToken(token));
        using var response = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData("")]
    [InlineData("weak-test-key")]
    public void Startup_RejectsMissingOrWeakKey(string key)
    {
        using var factory = new AuthTestFactory().WithWebHostBuilder(builder => builder.ConfigureAppConfiguration((_, config) =>
            config.AddInMemoryCollection(new Dictionary<string, string?> { ["Jwt:SigningKey"] = key })));
        var exception = Assert.Throws<OptionsValidationException>(() => factory.CreateClient());
        Assert.Contains("Jwt:SigningKey", exception.Message);
    }

    [Theory]
    [InlineData("Jwt:Issuer", "")]
    [InlineData("Jwt:Audience", "")]
    [InlineData("Jwt:AccessTokenMinutes", "0")]
    [InlineData("Jwt:AccessTokenMinutes", "61")]
    public void Startup_RejectsInvalidConfiguration(string name, string value)
    {
        using var factory = new AuthTestFactory().WithWebHostBuilder(builder => builder.ConfigureAppConfiguration((_, config) =>
            config.AddInMemoryCollection(new Dictionary<string, string?> { [name] = value })));
        Assert.Throws<OptionsValidationException>(() => factory.CreateClient());
    }

    [Fact]
    public async Task LoginFailures_AreIndistinguishable()
    {
        using var factory = new AuthTestFactory();
        var user = MakeUser();
        user.PasswordHash = new PasswordService().Hash(user, AuthTestFactory.TestPassword);
        factory.Store.User = user;
        using var client = factory.CreateClient();
        async Task<string> Failure(string email, string password)
        {
            using var response = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
            return await response.Content.ReadAsStringAsync();
        }
        var unknown = await Failure("unknown@example.invalid", AuthTestFactory.TestPassword);
        var wrong = await Failure("analyst@example.invalid", "TEST_ONLY_wrong");
        user.IsActive = false;
        var inactive = await Failure("analyst@example.invalid", AuthTestFactory.TestPassword);
        Assert.True(unknown == wrong && wrong == inactive);
    }

    [Theory]
    [InlineData(UserRole.Admin)]
    [InlineData(UserRole.SocAnalyst)]
    public async Task LoginAndMe_ReturnOnlyPublicIdentity(UserRole role)
    {
        using var factory = new AuthTestFactory();
        var user = MakeUser(role);
        user.PasswordHash = new PasswordService().Hash(user, AuthTestFactory.TestPassword);
        factory.Store.User = user;
        using var client = factory.CreateClient();
        using var anonymous = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, anonymous.StatusCode);
        using var login = await client.PostAsJsonAsync("/api/auth/login", new { email = "analyst@example.invalid", password = AuthTestFactory.TestPassword });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        Assert.True(login.Headers.CacheControl?.NoStore);
        var body = await login.Content.ReadAsStringAsync();
        Assert.False(body.Contains(user.PasswordHash, StringComparison.Ordinal));
        Assert.False(body.Contains(AuthTestFactory.TestPassword, StringComparison.Ordinal));
        Assert.False(body.Contains(AuthTestFactory.TestKey, StringComparison.Ordinal));
        using var json = JsonDocument.Parse(body);
        Assert.Equal(new[] { "accessToken", "expiresAtUtc", "tokenType", "user" }, json.RootElement.EnumerateObject().Select(p => p.Name).Order());
        Assert.Equal("Bearer", json.RootElement.GetProperty("tokenType").GetString());
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", json.RootElement.GetProperty("accessToken").GetString());
        factory.Store.User = null; // /me must use trusted claims, not database lookup.
        using var me = await client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        using var identity = JsonDocument.Parse(await me.Content.ReadAsStringAsync());
        Assert.Equal(new[] { "displayName", "email", "id", "role" }, identity.RootElement.EnumerateObject().Select(p => p.Name).Order());
        Assert.Equal(user.Id, identity.RootElement.GetProperty("id").GetGuid());
        Assert.Equal(user.Email, identity.RootElement.GetProperty("email").GetString());
        Assert.Equal(user.DisplayName, identity.RootElement.GetProperty("displayName").GetString());
        Assert.Equal(role.ToString(), identity.RootElement.GetProperty("role").GetString());
        Assert.True(json.RootElement.GetProperty("user").GetRawText() == identity.RootElement.GetRawText());
    }

    [Theory]
    [InlineData(SocPolicies.AdminOnly, UserRole.Admin, true)]
    [InlineData(SocPolicies.AdminOnly, UserRole.SocAnalyst, false)]
    [InlineData(SocPolicies.SocOperations, UserRole.Admin, true)]
    [InlineData(SocPolicies.SocOperations, UserRole.SocAnalyst, true)]
    public async Task Policies_EnforceRoles(string policy, UserRole role, bool expected)
    {
        using var factory = new AuthTestFactory();
        var authorization = factory.Services.GetRequiredService<IAuthorizationService>();
        var principal = new ClaimsPrincipal(new ClaimsIdentity([new Claim("role", role.ToString())], "Bearer", "name", "role"));
        Assert.Equal(expected, (await authorization.AuthorizeAsync(principal, null, policy)).Succeeded);
        Assert.False((await authorization.AuthorizeAsync(new ClaimsPrincipal(), null, policy)).Succeeded);
    }

    [Theory]
    [InlineData("not-an-email", "test")]
    [InlineData("analyst@example.invalid", "")]
    public async Task Login_RejectsMalformedInput(string email, string password)
    {
        using var factory = new AuthTestFactory();
        using var client = factory.CreateClient();
        using var response = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task OpenApi_DeclaresBearerSchemeAndMeRequirement()
    {
        using var factory = new AuthTestFactory();
        using var client = factory.CreateClient();
        using var json = JsonDocument.Parse(await client.GetStringAsync("/openapi/v1.json"));
        var scheme = json.RootElement.GetProperty("components").GetProperty("securitySchemes").GetProperty("Bearer");
        Assert.Equal("http", scheme.GetProperty("type").GetString());
        Assert.Equal("bearer", scheme.GetProperty("scheme").GetString());
        Assert.True(json.RootElement.GetProperty("paths").GetProperty("/api/auth/me").GetProperty("get").GetProperty("security")[0].TryGetProperty("Bearer", out _));
    }

    private sealed class FixedClock(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }
}
