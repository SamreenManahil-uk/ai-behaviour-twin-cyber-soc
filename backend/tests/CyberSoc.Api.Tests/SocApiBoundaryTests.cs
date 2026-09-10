using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;
using CyberSoc.Api.Authentication;
using CyberSoc.Api.Configuration;
using Microsoft.Extensions.Options;
using System.Text.Json;
using CyberSoc.Api.Contracts.Common;
using CyberSoc.Api.Contracts.Soc;
using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Validation;

namespace CyberSoc.Api.Tests;

public sealed class SocApiBoundaryTests
{
    private static readonly string[] Routes =
    [
        "/api/endpoints", "/api/events", "/api/alerts", "/api/incidents", "/api/threats",
        "/api/endpoints/00000000-0000-0000-0000-000000000001",
        "/api/events/00000000-0000-0000-0000-000000000001",
        "/api/alerts/00000000-0000-0000-0000-000000000001",
        "/api/incidents/00000000-0000-0000-0000-000000000001",
        "/api/threats/00000000-0000-0000-0000-000000000001"
    ];

    [Fact]
    public async Task EverySocRoute_RequiresAuthentication()
    {
        using var factory = new AuthTestFactory();
        using var client = factory.CreateClient();
        foreach (var route in Routes)
        {
            using var response = await client.GetAsync(route);
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }

    [Theory]
    [InlineData("POST", "/api/endpoints")]
    [InlineData("PATCH", "/api/endpoints/00000000-0000-0000-0000-000000000001")]
    [InlineData("POST", "/api/events")]
    [InlineData("PATCH", "/api/alerts/00000000-0000-0000-0000-000000000001")]
    [InlineData("POST", "/api/incidents")]
    [InlineData("PATCH", "/api/incidents/00000000-0000-0000-0000-000000000001")]
    [InlineData("POST", "/api/threats")]
    [InlineData("PATCH", "/api/threats/00000000-0000-0000-0000-000000000001")]
    public async Task EverySocWriteRoute_RequiresAuthentication(string method, string route)
    {
        using var factory = new AuthTestFactory();
        using var request = new HttpRequestMessage(new HttpMethod(method), route) { Content = JsonContent.Create(new { }) };
        using var response = await factory.CreateClient().SendAsync(request);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AuthenticatedAnalyst_IsForbiddenFromAdminOnlyWrites()
    {
        using var factory = new AuthTestFactory();
        using var client = factory.CreateClient();
        var token = new JwtTokenService(Options.Create(new JwtOptions { Issuer = "soc-tests", Audience = "soc-test-client", SigningKey = AuthTestFactory.TestKey, AccessTokenMinutes = 15 }), TimeProvider.System).Issue(new CyberSoc.Api.Domain.Entities.User { Id = Guid.NewGuid(), Email = "analyst@example.invalid", DisplayName = "Analyst", PasswordHash = "hash", Role = UserRole.SocAnalyst, IsActive = true }).AccessToken;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        using var response = await client.PostAsJsonAsync("/api/endpoints", new { hostname = "fictional", operatingSystem = "Linux" });
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task SocRouteWithAuthenticatedAnalyst_ReachesAuthorizationBoundary()
    {
        using var factory = new AuthTestFactory();
        using var client = factory.CreateClient();
        var token = new CyberSoc.Api.Authentication.JwtTokenService(
            Microsoft.Extensions.Options.Options.Create(new CyberSoc.Api.Configuration.JwtOptions
            {
                Issuer = "soc-tests",
                Audience = "soc-test-client",
                SigningKey = AuthTestFactory.TestKey,
                AccessTokenMinutes = 15
            }), TimeProvider.System).Issue(new CyberSoc.Api.Domain.Entities.User
            {
                Id = Guid.NewGuid(),
                Email = "analyst@example.invalid",
                DisplayName = "Analyst",
                PasswordHash = "hash",
                Role = UserRole.SocAnalyst,
                IsActive = true
            }).AccessToken;
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        using var response = await client.GetAsync("/api/threats");
        // The analyst is authorized by SocOperations; test factory has no database configuration, so DI fails only after authorization.
        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData(0, 20)]
    [InlineData(1, 0)]
    [InlineData(1, 101)]
    public void Pagination_RejectsOutOfRangeValues(int page, int pageSize)
    {
        var query = new PageQuery { Page = page, PageSize = pageSize };
        var errors = Validate(query);
        Assert.NotEmpty(errors);
    }

    [Fact]
    public void Pagination_ResponseCalculatesDeterministicMetadata()
    {
        var response = new PageResponse<string>(["a", "b"], 2, 2, 5, 3);
        Assert.Equal(["a", "b"], response.Items);
        Assert.Equal((2, 2, 5, 3), (response.Page, response.PageSize, response.TotalItems, response.TotalPages));
    }

    [Fact]
    public void DateRange_RejectsReversedAndNonUtcBounds()
    {
        var query = new EventQuery { StartUtc = DateTimeOffset.UtcNow, EndUtc = DateTimeOffset.UtcNow.AddMinutes(-1) };
        Assert.Contains(Validate(query), error => error.ErrorMessage!.Contains("startUtc"));
        query = new EventQuery { StartUtc = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.FromHours(1)) };
        Assert.NotEmpty(Validate(query));
    }

    [Fact]
    public void EndpointInput_NormalizesAndValidatesHostAndIp()
    {
        var request = new CreateEndpointRequest { Hostname = " SENSOR-01.Example.Local. ", OperatingSystem = EndpointOperatingSystem.Linux, IpAddress = "192.0.2.10" };
        Assert.Equal("sensor-01.example.local", SocInput.Hostname(request.Hostname));
        Assert.True(SocInput.IsHostname(SocInput.Hostname(request.Hostname)));
        Assert.True(SocInput.IsIp(request.IpAddress));
        request = new CreateEndpointRequest { Hostname = "bad host", OperatingSystem = EndpointOperatingSystem.Linux, IpAddress = "999.1.1.1" };
        Assert.NotEmpty(Validate(request));
    }

    [Fact]
    public void EventInput_RequiresValidBoundedJsonAndExplicitFields()
    {
        var valid = new CreateEventRequest { EndpointId = Guid.NewGuid(), EventType = "process_start", Source = "simulator", EventTimestampUtc = DateTimeOffset.UtcNow, Severity = Severity.Low, RawPayload = "{\"fictional\":true}" };
        Assert.Empty(Validate(valid));
        var invalid = new CreateEventRequest { EndpointId = Guid.NewGuid(), EventType = "process_start", Source = "simulator", EventTimestampUtc = DateTimeOffset.UtcNow, Severity = Severity.Low, RawPayload = "not-json" };
        Assert.NotEmpty(Validate(invalid));
        var oversized = new CreateEventRequest { EndpointId = Guid.NewGuid(), EventType = "process_start", Source = "simulator", EventTimestampUtc = DateTimeOffset.UtcNow, Severity = Severity.Low, RawPayload = new string('x', 65537) };
        Assert.NotEmpty(Validate(oversized));
    }

    [Theory]
    [InlineData(IndicatorType.IpAddress, "192.0.2.1", true)]
    [InlineData(IndicatorType.IpAddress, "not-an-ip", false)]
    [InlineData(IndicatorType.Domain, "example.invalid", true)]
    [InlineData(IndicatorType.Domain, "localhost", false)]
    [InlineData(IndicatorType.FileHash, "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", true)]
    [InlineData(IndicatorType.FileHash, "xyz", false)]
    [InlineData(IndicatorType.Url, "https://example.invalid/path", true)]
    [InlineData(IndicatorType.Url, "javascript:alert(1)", false)]
    [InlineData(IndicatorType.Process, "powershell.exe", true)]
    [InlineData(IndicatorType.Process, "", false)]
    public void ThreatIndicatorValidation_EnforcesTypeSpecificRules(IndicatorType type, string value, bool expected)
        => Assert.Equal(expected, SocInput.Indicator(type, value) is not null);

    [Fact]
    public void ThreatInput_RejectsReversedTimesAndInvalidIndicator()
    {
        var request = new CreateThreatRequest { IndicatorType = IndicatorType.Domain, IndicatorValue = "example.invalid", ThreatName = "Test", ConfidenceScore = 50, Source = "Test", IsActive = true, FirstSeenAtUtc = DateTimeOffset.UtcNow, LastSeenAtUtc = DateTimeOffset.UtcNow.AddMinutes(-1) };
        Assert.Contains(Validate(request), error => error.ErrorMessage!.Contains("FirstSeenAtUtc"));
        request = new CreateThreatRequest { IndicatorType = IndicatorType.FileHash, IndicatorValue = "not-a-hash", ThreatName = "Test", ConfidenceScore = 50, Source = "Test", IsActive = true, FirstSeenAtUtc = DateTimeOffset.UtcNow, LastSeenAtUtc = DateTimeOffset.UtcNow };
        Assert.Contains(Validate(request), error => error.ErrorMessage!.Contains("Invalid indicator"));
    }

    [Fact]
    public void PatchContracts_RejectEmptyPatchAndPermitExplicitNullableClears()
    {
        Assert.NotEmpty(Validate(new PatchEndpointRequest()));
        var endpoint = new PatchEndpointRequest { IpAddress = null };
        Assert.Empty(Validate(endpoint));
        Assert.Empty(Validate(new PatchIncidentRequest { Status = IncidentStatus.Resolved }));
    }

    [Fact]
    public void PublicResponses_DoNotExposePasswordHash()
    {
        var json = JsonSerializer.Serialize(new { endpoint = new EndpointResponse(Guid.NewGuid(), "fictional", EndpointOperatingSystem.Linux, null, null, EndpointStatus.Healthy, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow) });
        Assert.DoesNotContain("password", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("PasswordHash", json, StringComparison.Ordinal);
    }

    private static IReadOnlyList<ValidationResult> Validate(object value)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(value, new ValidationContext(value), results, true);
        if (value is IValidatableObject validatable) results.AddRange(validatable.Validate(new ValidationContext(value)));
        return results;
    }
}
