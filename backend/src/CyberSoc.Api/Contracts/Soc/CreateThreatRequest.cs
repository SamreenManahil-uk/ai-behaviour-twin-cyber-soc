using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Validation;

namespace CyberSoc.Api.Contracts.Soc;

/// <summary>Explicit fields accepted by CreateThreatRequest; unknown JSON properties are rejected.</summary>
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class CreateThreatRequest : IValidatableObject
{
    /// <summary>IndicatorType.</summary>
    [EnumDataType(typeof(IndicatorType))]
    public required IndicatorType IndicatorType { get; init; }
    /// <summary>IndicatorValue.</summary>
    [Required, StringLength(2048), NotBlank]
    public required string IndicatorValue { get; init; }
    /// <summary>ThreatName.</summary>
    [Required, StringLength(250), NotBlank]
    public required string ThreatName { get; init; }
    /// <summary>Description.</summary>
    [StringLength(4000), NotBlank]
    public string? Description { get; init; }
    /// <summary>ConfidenceScore.</summary>
    [Range(typeof(decimal), "0", "100")]
    public required decimal ConfidenceScore { get; init; }
    /// <summary>Source.</summary>
    [Required, StringLength(200), NotBlank]
    public required string Source { get; init; }
    /// <summary>IsActive.</summary>

    public required bool IsActive { get; init; }
    /// <summary>FirstSeenAtUtc.</summary>
    [Utc]
    public required DateTimeOffset FirstSeenAtUtc { get; init; }
    /// <summary>LastSeenAtUtc.</summary>
    [Utc]
    public required DateTimeOffset LastSeenAtUtc { get; init; }
    /// <inheritdoc />
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (SocInput.Indicator(IndicatorType, IndicatorValue) is null) yield return new ValidationResult("Invalid indicator for the supplied type.", [nameof(IndicatorValue)]);
        if (FirstSeenAtUtc > LastSeenAtUtc) yield return new ValidationResult("FirstSeenAtUtc must not exceed LastSeenAtUtc.", [nameof(LastSeenAtUtc)]);
        yield break;
    }
}
