using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Validation;

namespace CyberSoc.Api.Contracts.Soc;

/// <summary>Explicit fields accepted by PatchThreatRequest; unknown JSON properties are rejected.</summary>
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class PatchThreatRequest : IValidatableObject
{
    /// <summary>ThreatName.</summary>
    [StringLength(250), NotBlank]
    public string? ThreatName { get; set { field = value; ThreatNameSpecified = true; } }
    internal bool ThreatNameSpecified { get; private set; }
    /// <summary>Description.</summary>
    [StringLength(4000), NotBlank]
    public string? Description { get; set { field = value; DescriptionSpecified = true; } }
    internal bool DescriptionSpecified { get; private set; }
    /// <summary>ConfidenceScore.</summary>
    [Range(typeof(decimal), "0", "100")]
    public decimal? ConfidenceScore { get; set { field = value; ConfidenceScoreSpecified = true; } }
    internal bool ConfidenceScoreSpecified { get; private set; }
    /// <summary>Source.</summary>
    [StringLength(200), NotBlank]
    public string? Source { get; set { field = value; SourceSpecified = true; } }
    internal bool SourceSpecified { get; private set; }
    /// <summary>IsActive.</summary>

    public bool? IsActive { get; set { field = value; IsActiveSpecified = true; } }
    internal bool IsActiveSpecified { get; private set; }
    /// <summary>LastSeenAtUtc.</summary>
    [Utc]
    public DateTimeOffset? LastSeenAtUtc { get; set { field = value; LastSeenAtUtcSpecified = true; } }
    internal bool LastSeenAtUtcSpecified { get; private set; }
    /// <inheritdoc />
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (!(ThreatNameSpecified || DescriptionSpecified || ConfidenceScoreSpecified || SourceSpecified || IsActiveSpecified || LastSeenAtUtcSpecified)) yield return new ValidationResult("Supply at least one mutable field.");
        if (ThreatNameSpecified && ThreatName is null) yield return new ValidationResult("ThreatName cannot be null.", [nameof(ThreatName)]);
        if (ConfidenceScoreSpecified && ConfidenceScore is null) yield return new ValidationResult("ConfidenceScore cannot be null.", [nameof(ConfidenceScore)]);
        if (SourceSpecified && Source is null) yield return new ValidationResult("Source cannot be null.", [nameof(Source)]);
        if (IsActiveSpecified && IsActive is null) yield return new ValidationResult("IsActive cannot be null.", [nameof(IsActive)]);
        if (LastSeenAtUtcSpecified && LastSeenAtUtc is null) yield return new ValidationResult("LastSeenAtUtc cannot be null.", [nameof(LastSeenAtUtc)]);
        yield break;
    }
}
