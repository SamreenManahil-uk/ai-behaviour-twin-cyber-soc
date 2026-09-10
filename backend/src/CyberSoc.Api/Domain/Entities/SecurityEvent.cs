using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Domain.Entities;

/// <summary>Persisted SecurityEvent record. All timestamp values must have a zero UTC offset.</summary>
public sealed class SecurityEvent
{
    /// <summary>Id.</summary>
    public Guid Id { get; set; }

    /// <summary>EndpointId.</summary>
    public Guid EndpointId { get; set; }

    /// <summary>Endpoint.</summary>
    public Endpoint Endpoint { get; set; } = null!;

    /// <summary>EventType.</summary>
    public required string EventType { get; set; }

    /// <summary>Source.</summary>
    public required string Source { get; set; }

    /// <summary>EventTimestampUtc.</summary>
    public DateTimeOffset EventTimestampUtc { get; set; }

    /// <summary>Severity.</summary>
    public Severity Severity { get; set; }

    /// <summary>ProcessName.</summary>
    public string? ProcessName { get; set; }

    /// <summary>UserName.</summary>
    public string? UserName { get; set; }

    /// <summary>SourceIp.</summary>
    public string? SourceIp { get; set; }

    /// <summary>DestinationIp.</summary>
    public string? DestinationIp { get; set; }

    /// <summary>RawPayload.</summary>
    public required string RawPayload { get; set; }

    /// <summary>IngestedAtUtc.</summary>
    public DateTimeOffset IngestedAtUtc { get; set; }

    /// <summary>Alert.</summary>
    public Alert? Alert { get; set; }
}
