using Microsoft.AspNetCore.Http;
using System.Net;
using System.Text;
using System.Text.Json;
using CyberSoc.Api.Configuration;
using CyberSoc.Api.Contracts.Ml;
using CyberSoc.Api.Integration.Ml;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace CyberSoc.Api.Tests;

public sealed class MlInferenceClientTests
{
    [Fact]
    public async Task PredictNetwork_ForwardsRequestAndReadsValidResponse()
    {
        string? capturedBody = null;
        Uri? capturedUri = null;

        var handler = new StubHandler(async (request, cancellationToken) =>
        {
            capturedUri = request.RequestUri;
            capturedBody = await request.Content!.ReadAsStringAsync(cancellationToken);

            return JsonResponse(
                """
                {
                  "classification": "malicious",
                  "predictedMalicious": true,
                  "supervisedThreatScore": 0.91,
                  "supervisedRiskScore": 91.0,
                  "predictedAnomaly": true,
                  "anomalyScore": 0.87,
                  "anomalyRiskScore": 87.0,
                  "xgboostModelVersion": "xgboost-test-v1",
                  "anomalyModelVersion": "isolation-test-v1",
                  "explanations": [
                    "Supervised score is not a calibrated probability.",
                    "Anomaly score is unusualness, not probability."
                  ]
                }
                """);
        });

        var client = CreateClient(handler);
        var request = Request();

        var response = await client.PredictNetworkAsync(request, CancellationToken.None);

        Assert.Equal(
            new Uri("http://127.0.0.1:8001/v1/predict/network"),
            capturedUri);
        Assert.NotNull(capturedBody);
        Assert.Contains("\"features\"", capturedBody, StringComparison.Ordinal);
        Assert.DoesNotContain("password", capturedBody, StringComparison.OrdinalIgnoreCase);
        Assert.Equal("malicious", response.Classification);
        Assert.True(response.PredictedMalicious);
        Assert.Equal(0.91, response.SupervisedThreatScore);
        Assert.True(response.PredictedAnomaly);
        Assert.Equal(0.87, response.AnomalyScore);
    }

    [Fact]
    public async Task PredictNetwork_UnavailableServiceBecomes503()
    {
        var handler = new StubHandler((_, _) =>
            throw new HttpRequestException("Test-only connection failure"));

        var client = CreateClient(handler);

        var exception = await Assert.ThrowsAsync<MlServiceException>(
            () => client.PredictNetworkAsync(Request(), CancellationToken.None));

        Assert.Equal(StatusCodes.Status503ServiceUnavailable, exception.StatusCode);
        Assert.Equal("ML inference service is unavailable.", exception.Title);
        Assert.DoesNotContain(
            "connection failure",
            exception.Title,
            StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task PredictNetwork_ValidationFailureBecomes422()
    {
        var handler = new StubHandler((_, _) => Task.FromResult(
            new HttpResponseMessage(HttpStatusCode.UnprocessableEntity)));

        var client = CreateClient(handler);

        var exception = await Assert.ThrowsAsync<MlServiceException>(
            () => client.PredictNetworkAsync(Request(), CancellationToken.None));

        Assert.Equal(StatusCodes.Status422UnprocessableEntity, exception.StatusCode);
        Assert.Equal("ML request validation failed.", exception.Title);
    }

    [Fact]
    public async Task PredictNetwork_InvalidUpstreamResponseBecomes502()
    {
        var handler = new StubHandler((_, _) => Task.FromResult(JsonResponse(
            """
            {
              "classification": "malicious",
              "predictedMalicious": true,
              "supervisedThreatScore": 5.0,
              "supervisedRiskScore": 500.0,
              "predictedAnomaly": false,
              "anomalyScore": 0.5,
              "anomalyRiskScore": 50.0,
              "xgboostModelVersion": "xgb",
              "anomalyModelVersion": "iforest",
              "explanations": ["invalid test response"]
            }
            """)));

        var client = CreateClient(handler);

        var exception = await Assert.ThrowsAsync<MlServiceException>(
            () => client.PredictNetworkAsync(Request(), CancellationToken.None));

        Assert.Equal(StatusCodes.Status502BadGateway, exception.StatusCode);
    }

    [Fact]
    public async Task PredictNetwork_MissingConfigurationBecomes503()
    {
        var handler = new StubHandler((_, _) =>
            throw new InvalidOperationException("Handler must not be called"));

        var options = Options.Create(new MlServiceOptions
        {
            BaseUrl = "",
            TimeoutSeconds = 10
        });

        var client = new MlInferenceClient(
            new HttpClient(handler),
            options,
            NullLogger<MlInferenceClient>.Instance);

        var exception = await Assert.ThrowsAsync<MlServiceException>(
            () => client.PredictNetworkAsync(Request(), CancellationToken.None));

        Assert.Equal(StatusCodes.Status503ServiceUnavailable, exception.StatusCode);
    }

    private static MlInferenceClient CreateClient(HttpMessageHandler handler)
    {
        var options = Options.Create(new MlServiceOptions
        {
            BaseUrl = "http://127.0.0.1:8001",
            TimeoutSeconds = 10
        });

        return new MlInferenceClient(
            new HttpClient(handler),
            options,
            NullLogger<MlInferenceClient>.Instance);
    }

    private static NetworkPredictionRequest Request()
    {
        return new NetworkPredictionRequest(new Dictionary<string, JsonElement>
        {
            ["dur"] = JsonDocument.Parse("1.5").RootElement.Clone(),
            ["proto"] = JsonDocument.Parse("\"tcp\"").RootElement.Clone()
        });
    }

    private static HttpResponseMessage JsonResponse(string json)
    {
        return new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
    }

    private sealed class StubHandler(
        Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> response)
        : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken) =>
            response(request, cancellationToken);
    }
}
