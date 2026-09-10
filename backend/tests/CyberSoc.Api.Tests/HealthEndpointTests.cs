using System.Globalization;
using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace CyberSoc.Api.Tests;

public sealed class HealthEndpointTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task GetHealth_ReturnsHealthyJsonWithVersionAndUtcTimestamp()
    {
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
        var before = DateTimeOffset.UtcNow;
        using var response = await client.GetAsync("/api/health");
        var after = DateTimeOffset.UtcNow;

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var health = document.RootElement;
        Assert.Equal("healthy", health.GetProperty("status").GetString());
        Assert.Equal("CyberSoc.Api", health.GetProperty("service").GetString());
        Assert.False(string.IsNullOrWhiteSpace(health.GetProperty("version").GetString()));
        var rawTimestamp = health.GetProperty("timestamp").GetString();
        Assert.NotNull(rawTimestamp);
        Assert.True(rawTimestamp.EndsWith('Z') || rawTimestamp.EndsWith("+00:00", StringComparison.Ordinal));
        Assert.True(DateTimeOffset.TryParse(rawTimestamp, CultureInfo.InvariantCulture,
            DateTimeStyles.None, out var timestamp));
        Assert.Equal(TimeSpan.Zero, timestamp.Offset);
        Assert.InRange(timestamp, before, after);
    }

    [Fact]
    public async Task UnknownApiRoute_ReturnsNotFound()
    {
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
        using var response = await client.GetAsync("/api/does-not-exist");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
