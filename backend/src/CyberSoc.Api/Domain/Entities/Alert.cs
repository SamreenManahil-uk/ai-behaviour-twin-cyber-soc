using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Domain.Entities;

/// <summary>Persisted Alert record. All timestamp values must have a zero UTC offset.</summary>
public sealed class Alert
{
    /// <summary>Id.</summary>
    public Guid Id { get; set; }

    /// <summary>SecurityEventId.</summary>
    public Guid SecurityEventId { get; set; }

    /// <summary>SecurityEvent.</summary>
    public SecurityEvent SecurityEvent { get; set; } = null!;

    /// <summary>EndpointId.</summary>
    public Guid EndpointId { get; set; }

    /// <summary>Endpoint.</summary>
    public Endpoint Endpoint { get; set; } = null!;

    /// <summary>Title.</summary>
    public required string Title { get; set; }

    /// <summary>Description.</summary>
    public required string Description { get; set; }

    /// <summary>Severity.</summary>
    public Severity Severity { get; set; }

    /// <summary>Status.</summary>
    public AlertStatus Status { get; set; }

    /// <summary>RiskScore.</summary>
    public decimal RiskScore
    {
        get;
        set
        {
            if (value is < 0 or > 100)
            {
                throw new ArgumentOutOfRangeException(nameof(value), "Score must be between 0 and 100 inclusive.");
            }

            field = value;
        }
    }

    /// <summary>DetectionSource.</summary>
    public DetectionSource DetectionSource { get; set; }

    /// <summary>MitreTechniqueId.</summary>
    public string? MitreTechniqueId { get; set; }

    /// <summary>MitreTechniqueName.</summary>
    public string? MitreTechniqueName { get; set; }

    /// <summary>CreatedAtUtc.</summary>
    public DateTimeOffset CreatedAtUtc { get; set; }

    /// <summary>UpdatedAtUtc.</summary>
    public DateTimeOffset UpdatedAtUtc { get; set; }

    /// <summary>IncidentId.</summary>
    public Guid? IncidentId { get; set; }

    /// <summary>Incident.</summary>
    public Incident? Incident { get; set; }
}
