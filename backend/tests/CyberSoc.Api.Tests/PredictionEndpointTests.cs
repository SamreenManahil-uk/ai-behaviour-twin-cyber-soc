using System.Text.Json;
using System.Net;
using System.Net.Http.Json;
using CyberSoc.Api.Authorization;
using CyberSoc.Api.Controllers;
using CyberSoc.Api.Contracts.Ml;
using Microsoft.AspNetCore.Authorization;

namespace CyberSoc.Api.Tests;

public sealed class PredictionEndpointTests
{
    [Fact]
    public async Task Predict_WithoutToken_Returns401()
    {
        await using var factory = new AuthTestFactory();
        using var client = factory.CreateClient();

        using var response = await client.PostAsJsonAsync(
            "/api/predict",
            new NetworkPredictionRequest([]));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public void PredictionController_RequiresSocOperationsPolicy()
    {
        var attribute = Assert.Single(
            typeof(PredictionController)
                .GetCustomAttributes(typeof(AuthorizeAttribute), inherit: true)
                .Cast<AuthorizeAttribute>());

        Assert.Equal(SocPolicies.SocOperations, attribute.Policy);
    }

    [Fact]
    public async Task OpenApi_ContainsProtectedPredictionRoute()
    {
        await using var factory = new AuthTestFactory();
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/openapi/v1.json");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var document = await response.Content.ReadFromJsonAsync<JsonElement>();
        var operation = document
            .GetProperty("paths")
            .GetProperty("/api/predict")
            .GetProperty("post");

        Assert.True(operation.TryGetProperty("security", out var security));
        Assert.NotEqual(JsonValueKind.Null, security.ValueKind);
    }
}
