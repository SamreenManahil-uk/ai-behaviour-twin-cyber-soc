using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Domain.Entities;

/// <summary>Persisted Threat record. All timestamp values must have a zero UTC offset.</summary>
public sealed class Threat
{
    /// <summary>Id.</summary>
    public Guid Id { get; set; }

    /// <summary>IndicatorType.</summary>
    public IndicatorType IndicatorType { get; set; }

    /// <summary>IndicatorValue.</summary>
    public required string IndicatorValue { get; set; }

    /// <summary>ThreatName.</summary>
    public required string ThreatName { get; set; }

    /// <summary>Description.</summary>
    public string? Description { get; set; }

    /// <summary>ConfidenceScore.</summary>
    public decimal ConfidenceScore
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

    /// <summary>Source.</summary>
    public required string Source { get; set; }

    /// <summary>IsActive.</summary>
    public bool IsActive { get; set; }

    /// <summary>FirstSeenAtUtc.</summary>
    public DateTimeOffset FirstSeenAtUtc { get; set; }

    /// <summary>LastSeenAtUtc.</summary>
    public DateTimeOffset LastSeenAtUtc { get; set; }

    /// <summary>CreatedAtUtc.</summary>
    public DateTimeOffset CreatedAtUtc { get; set; }
}
