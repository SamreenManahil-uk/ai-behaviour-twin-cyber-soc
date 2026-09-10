namespace CyberSoc.Api.Contracts.Ml;

/// <summary>
/// Supervised threat and unsupervised anomaly signals returned by the ML service.
/// Neither score is presented as a calibrated attack probability.
/// </summary>
public sealed record NetworkPredictionResponse(
    string Classification,
    bool PredictedMalicious,
    double SupervisedThreatScore,
    double SupervisedRiskScore,
    bool PredictedAnomaly,
    double AnomalyScore,
    double AnomalyRiskScore,
    string XgboostModelVersion,
    string AnomalyModelVersion,
    IReadOnlyList<string> Explanations);
