using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Text.Json;
using CyberSoc.Api.Contracts.Ml;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CyberSoc.Api.Tests;

public sealed class LiveMlIntegrationTests
{
    [Fact]
    public async Task AuthenticatedAspNetEndpoint_CallsRealFastApiModels()
    {
        if (Environment.GetEnvironmentVariable("RUN_LIVE_ML_INTEGRATION") != "1")
        {
            return;
        }

        await using var factory = new LiveMlFactory();
        using var client = factory.CreateClient();
        var features = ReadFirstOfficialTestEvent();

        using var response = await client.PostAsJsonAsync(
            "/api/predict",
            new NetworkPredictionRequest(features));

        var body = await response.Content.ReadAsStringAsync();

        Assert.True(
            response.StatusCode == HttpStatusCode.OK,
            $"Expected HTTP 200 but received {response.StatusCode}: {body}");

        var result = JsonSerializer.Deserialize<NetworkPredictionResponse>(
            body,
            new JsonSerializerOptions(JsonSerializerDefaults.Web));

        Assert.NotNull(result);
        Assert.InRange(result.SupervisedThreatScore, 0, 1);
        Assert.InRange(result.SupervisedRiskScore, 0, 100);
        Assert.InRange(result.AnomalyScore, 0, 1);
        Assert.InRange(result.AnomalyRiskScore, 0, 100);
        Assert.Equal("xgboost-network-v1", result.XgboostModelVersion);
        Assert.Equal("isolation-forest-network-v1", result.AnomalyModelVersion);

        Console.WriteLine(
            "LIVE_DOTNET_FASTAPI_RESULT classification={0} supervised={1} anomaly={2}",
            result.Classification,
            result.SupervisedThreatScore,
            result.AnomalyScore);
    }

    private static Dictionary<string, JsonElement> ReadFirstOfficialTestEvent()
    {
        var root = FindRepositoryRoot();
        var path = Path.Combine(
            root,
            "ml-service",
            "data",
            "raw",
            "UNSW_NB15_testing-set.csv");

        using var reader = new StreamReader(path);
        var headerLine = reader.ReadLine()
            ?? throw new InvalidOperationException("Dataset header is missing.");
        var valueLine = reader.ReadLine()
            ?? throw new InvalidOperationException("Dataset row is missing.");

        var headers = headerLine.Split(',');
        var values = valueLine.Split(',');

        if (headers.Length != values.Length)
        {
            throw new InvalidOperationException(
                "Dataset row does not match its header.");
        }

        var excluded = new HashSet<string>(
            ["id", "label", "attack_cat"],
            StringComparer.Ordinal);

        var features = new Dictionary<string, JsonElement>(
            StringComparer.Ordinal);

        for (var index = 0; index < headers.Length; index++)
        {
            var name = headers[index];
            if (excluded.Contains(name))
            {
                continue;
            }

            var raw = values[index];
            features[name] = double.TryParse(
                raw,
                NumberStyles.Float,
                CultureInfo.InvariantCulture,
                out var number)
                ? JsonSerializer.SerializeToElement(number)
                : JsonSerializer.SerializeToElement(raw);
        }

        return features;
    }

    private static string FindRepositoryRoot()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);

        while (current is not null)
        {
            if (Directory.Exists(Path.Combine(current.FullName, "ml-service")) &&
                Directory.Exists(Path.Combine(current.FullName, "backend")))
            {
                return current.FullName;
            }

            current = current.Parent;
        }

        throw new InvalidOperationException("Repository root was not found.");
    }

    private sealed class LiveMlFactory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureAppConfiguration((_, configuration) =>
                configuration.AddInMemoryCollection(
                    new Dictionary<string, string?>
                    {
                        ["Jwt:Issuer"] = "live-ml-test",
                        ["Jwt:Audience"] = "live-ml-test-client",
                        ["Jwt:SigningKey"] =
                            "TEST_ONLY_LIVE_ML_SIGNING_KEY_0123456789_ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                        ["Jwt:AccessTokenMinutes"] = "15",
                        ["MlService:BaseUrl"] = "http://127.0.0.1:8001",
                        ["MlService:TimeoutSeconds"] = "30"
                    }));

            builder.ConfigureTestServices(services =>
            {
                services
                    .AddAuthentication(options =>
                    {
                        options.DefaultAuthenticateScheme =
                            LiveTestAuthHandler.SchemeName;
                        options.DefaultChallengeScheme =
                            LiveTestAuthHandler.SchemeName;
                        options.DefaultForbidScheme =
                            LiveTestAuthHandler.SchemeName;
                    })
                    .AddScheme<AuthenticationSchemeOptions, LiveTestAuthHandler>(
                        LiveTestAuthHandler.SchemeName,
                        _ => { });
            });
        }
    }

    private sealed class LiveTestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : AuthenticationHandler<AuthenticationSchemeOptions>(
            options,
            logger,
            encoder)
    {
        public const string SchemeName = "LiveMlTest";

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            Claim[] claims =
            [
                new(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new(ClaimTypes.Email, "analyst@example.local"),
                new(ClaimTypes.Name, "Test SOC Analyst"),
                new(ClaimTypes.Role, "SocAnalyst")
            ];

            var identity = new ClaimsIdentity(claims, SchemeName);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, SchemeName);

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}
