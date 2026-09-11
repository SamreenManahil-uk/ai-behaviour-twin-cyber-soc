using CyberSoc.Api.Domain.Entities;

namespace CyberSoc.Api.Realtime;

/// <summary>Maps persisted alerts to safe real-time summaries.</summary>
public static class AlertRealtimeMapper
{
    /// <summary>
    /// Creates a notification without exposing raw security-event payloads.
    /// </summary>
    public static AlertRealtimeMessage Map(Alert alert)
    {
        ArgumentNullException.ThrowIfNull(alert);

        return new AlertRealtimeMessage
        {
            AlertId = alert.Id,
            EndpointId = alert.EndpointId,
            Title = alert.Title,
            Severity = alert.Severity,
            Status = alert.Status,
            RiskScore = alert.RiskScore,
            DetectionSource = alert.DetectionSource,
            MitreTechniqueId = alert.MitreTechniqueId,
            OccurredAtUtc = alert.UpdatedAtUtc,
        };
    }
}
