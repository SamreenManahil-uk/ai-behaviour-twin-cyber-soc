using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Validation;

namespace CyberSoc.Api.Contracts.Soc;

/// <summary>Bounded, one-based pagination.</summary>
public class PageQuery
{
    /// <summary>One-based page number.</summary>
    [Range(1, 1000000)]
    public int Page { get; set; } = 1;
    /// <summary>Items per page, at most 100.</summary>
    [Range(1, 100)]
    public int PageSize { get; set; } = 20;
}

/// <summary>Inclusive UTC date filtering.</summary>
public class DateQuery : PageQuery, IValidatableObject
{
    /// <summary>Inclusive lower date bound.</summary>
    [Utc]
    public DateTimeOffset? StartUtc { get; set; }
    /// <summary>Inclusive upper date bound.</summary>
    [Utc]
    public DateTimeOffset? EndUtc { get; set; }
    /// <inheritdoc />
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (StartUtc > EndUtc) yield return new ValidationResult("startUtc must not exceed endUtc.", [nameof(StartUtc), nameof(EndUtc)]);
    }
}

/// <summary>Filters for EndpointQuery.</summary>
public sealed class EndpointQuery : PageQuery
{
    /// <summary>Status filter.</summary>
    [EnumDataType(typeof(EndpointStatus))]
    public EndpointStatus? Status { get; set; }
    /// <summary>OperatingSystem filter.</summary>
    [EnumDataType(typeof(EndpointOperatingSystem))]
    public EndpointOperatingSystem? OperatingSystem { get; set; }
    /// <summary>Search filter.</summary>
    [StringLength(253), NotBlank]
    public string? Search { get; set; }
}

/// <summary>Filters for EventQuery.</summary>
public sealed class EventQuery : DateQuery
{
    /// <summary>EndpointId filter.</summary>
    [NotEmptyGuid]
    public Guid? EndpointId { get; set; }
    /// <summary>Severity filter.</summary>
    [EnumDataType(typeof(Severity))]
    public Severity? Severity { get; set; }
    /// <summary>EventType filter.</summary>
    [StringLength(100), NotBlank]
    public string? EventType { get; set; }
    /// <summary>Source filter.</summary>
    [StringLength(200), NotBlank]
    public string? Source { get; set; }
}

/// <summary>Filters for AlertQuery.</summary>
public sealed class AlertQuery : DateQuery
{
    /// <summary>Severity filter.</summary>
    [EnumDataType(typeof(Severity))]
    public Severity? Severity { get; set; }
    /// <summary>Status filter.</summary>
    [EnumDataType(typeof(AlertStatus))]
    public AlertStatus? Status { get; set; }
    /// <summary>EndpointId filter.</summary>
    [NotEmptyGuid]
    public Guid? EndpointId { get; set; }
    /// <summary>DetectionSource filter.</summary>
    [EnumDataType(typeof(DetectionSource))]
    public DetectionSource? DetectionSource { get; set; }
}

/// <summary>Filters for IncidentQuery.</summary>
public sealed class IncidentQuery : DateQuery
{
    /// <summary>Severity filter.</summary>
    [EnumDataType(typeof(Severity))]
    public Severity? Severity { get; set; }
    /// <summary>Status filter.</summary>
    [EnumDataType(typeof(IncidentStatus))]
    public IncidentStatus? Status { get; set; }
    /// <summary>AssignedUserId filter.</summary>
    [NotEmptyGuid]
    public Guid? AssignedUserId { get; set; }
}

/// <summary>Filters for ThreatQuery.</summary>
public sealed class ThreatQuery : PageQuery
{
    /// <summary>IndicatorType filter.</summary>
    [EnumDataType(typeof(IndicatorType))]
    public IndicatorType? IndicatorType { get; set; }
    /// <summary>IsActive filter.</summary>

    public bool? IsActive { get; set; }
    /// <summary>MinimumConfidence filter.</summary>
    [Range(typeof(decimal), "0", "100")]
    public decimal? MinimumConfidence { get; set; }
    /// <summary>Search filter.</summary>
    [StringLength(2048), NotBlank]
    public string? Search { get; set; }
}
