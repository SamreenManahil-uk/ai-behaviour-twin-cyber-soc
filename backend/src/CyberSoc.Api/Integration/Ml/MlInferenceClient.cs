using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using CyberSoc.Api.Configuration;
using CyberSoc.Api.Contracts.Ml;
using Microsoft.Extensions.Options;

namespace CyberSoc.Api.Integration.Ml;

/// <summary>Calls the private FastAPI inference service without logging event features.</summary>
public sealed class MlInferenceClient(
    HttpClient httpClient,
    IOptions<MlServiceOptions> options,
    ILogger<MlInferenceClient> logger) : IMlInferenceClient
{
    /// <inheritdoc />
    public async Task<NetworkPredictionResponse> PredictNetworkAsync(
        NetworkPredictionRequest request,
        CancellationToken cancellationToken)
    {
        var settings = options.Value;
        var baseUri = ValidateConfiguration(settings);

        using var timeoutSource =
            CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutSource.CancelAfter(TimeSpan.FromSeconds(settings.TimeoutSeconds));

        HttpResponseMessage response;
        try
        {
            response = await httpClient.PostAsJsonAsync(
                new Uri(baseUri, "/v1/predict/network"),
                request,
                timeoutSource.Token);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning("ML inference timed out.");
            throw new MlServiceException(
                StatusCodes.Status504GatewayTimeout,
                "ML inference timed out.");
        }
        catch (HttpRequestException)
        {
            logger.LogWarning("ML inference service is unavailable.");
            throw new MlServiceException(
                StatusCodes.Status503ServiceUnavailable,
                "ML inference service is unavailable.");
        }

        using (response)
        {
            if (!response.IsSuccessStatusCode)
            {
                throw CreateUpstreamException(response.StatusCode);
            }

            NetworkPredictionResponse? result;
            try
            {
                result = await response.Content.ReadFromJsonAsync<NetworkPredictionResponse>(
                    cancellationToken: timeoutSource.Token);
            }
            catch (JsonException)
            {
                logger.LogWarning("ML service returned malformed JSON.");
                throw new MlServiceException(
                    StatusCodes.Status502BadGateway,
                    "ML service returned an invalid response.");
            }

            ValidateResponse(result);
            return result!;
        }
    }

    private static Uri ValidateConfiguration(MlServiceOptions settings)
    {
        if (settings.TimeoutSeconds is < 1 or > 120)
        {
            throw new MlServiceException(
                StatusCodes.Status503ServiceUnavailable,
                "ML service configuration is unavailable.");
        }

        if (!Uri.TryCreate(settings.BaseUrl, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            throw new MlServiceException(
                StatusCodes.Status503ServiceUnavailable,
                "ML service configuration is unavailable.");
        }

        return uri;
    }

    private static MlServiceException CreateUpstreamException(HttpStatusCode statusCode)
    {
        return statusCode switch
        {
            HttpStatusCode.UnprocessableEntity => new MlServiceException(
                StatusCodes.Status422UnprocessableEntity,
                "ML request validation failed."),
            HttpStatusCode.ServiceUnavailable => new MlServiceException(
                StatusCodes.Status503ServiceUnavailable,
                "ML inference service is unavailable."),
            _ => new MlServiceException(
                StatusCodes.Status502BadGateway,
                "ML inference service returned an unsuccessful response.")
        };
    }

    private static void ValidateResponse(NetworkPredictionResponse? result)
    {
        if (result is null ||
            string.IsNullOrWhiteSpace(result.Classification) ||
            string.IsNullOrWhiteSpace(result.XgboostModelVersion) ||
            string.IsNullOrWhiteSpace(result.AnomalyModelVersion) ||
            result.Explanations is null ||
            result.Explanations.Any(string.IsNullOrWhiteSpace) ||
            !ValidUnitScore(result.SupervisedThreatScore) ||
            !ValidRiskScore(result.SupervisedRiskScore) ||
            !ValidUnitScore(result.AnomalyScore) ||
            !ValidRiskScore(result.AnomalyRiskScore))
        {
            throw new MlServiceException(
                StatusCodes.Status502BadGateway,
                "ML service returned an invalid response.");
        }
    }

    private static bool ValidUnitScore(double value) =>
        double.IsFinite(value) && value is >= 0 and <= 1;

    private static bool ValidRiskScore(double value) =>
        double.IsFinite(value) && value is >= 0 and <= 100;
}
