using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Realtime;

/// <summary>
/// Safe alert summary delivered to authorized real-time SOC clients.
/// Raw security-event payloads are intentionally excluded.
/// </summary>
public sealed record AlertRealtimeMessage
{
    /// <summary>Alert identifier.</summary>
    public required Guid AlertId { get; init; }

    /// <summary>Related endpoint identifier.</summary>
    public required Guid EndpointId { get; init; }

    /// <summary>Human-readable alert title.</summary>
    public required string Title { get; init; }

    /// <summary>Current alert severity.</summary>
    public required Severity Severity { get; init; }

    /// <summary>Current triage status.</summary>
    public required AlertStatus Status { get; init; }

    /// <summary>Bounded risk score from zero to one hundred.</summary>
    public required decimal RiskScore { get; init; }

    /// <summary>Detection source that produced the alert.</summary>
    public required DetectionSource DetectionSource { get; init; }

    /// <summary>Optional MITRE ATT&amp;CK technique identifier.</summary>
    public string? MitreTechniqueId { get; init; }

    /// <summary>UTC time at which this real-time message was produced.</summary>
    public required DateTimeOffset OccurredAtUtc { get; init; }
}
