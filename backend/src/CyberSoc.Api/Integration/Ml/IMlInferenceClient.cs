using CyberSoc.Api.Contracts.Ml;

namespace CyberSoc.Api.Integration.Ml;

/// <summary>Boundary between the SOC API and its internal Python ML service.</summary>
public interface IMlInferenceClient
{
    /// <summary>Scores one validated network-flow event.</summary>
    Task<NetworkPredictionResponse> PredictNetworkAsync(
        NetworkPredictionRequest request,
        CancellationToken cancellationToken);
}
