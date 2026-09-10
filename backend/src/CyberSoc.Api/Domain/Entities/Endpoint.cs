using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Domain.Entities;

/// <summary>Persisted Endpoint record. All timestamp values must have a zero UTC offset.</summary>
public sealed class Endpoint
{
    /// <summary>Id.</summary>
    public Guid Id { get; set; }

    /// <summary>Hostname.</summary>
    public required string Hostname { get; set; }

    /// <summary>OperatingSystem.</summary>
    public EndpointOperatingSystem OperatingSystem { get; set; }

    /// <summary>IpAddress.</summary>
    public string? IpAddress { get; set; }

    /// <summary>AgentVersion.</summary>
    public string? AgentVersion { get; set; }

    /// <summary>Status.</summary>
    public EndpointStatus Status { get; set; }

    /// <summary>LastSeenAtUtc.</summary>
    public DateTimeOffset LastSeenAtUtc { get; set; }

    /// <summary>CreatedAtUtc.</summary>
    public DateTimeOffset CreatedAtUtc { get; set; }

    /// <summary>SecurityEvents.</summary>
    public ICollection<SecurityEvent> SecurityEvents { get; } = [];

    /// <summary>Alerts.</summary>
    public ICollection<Alert> Alerts { get; } = [];
}
