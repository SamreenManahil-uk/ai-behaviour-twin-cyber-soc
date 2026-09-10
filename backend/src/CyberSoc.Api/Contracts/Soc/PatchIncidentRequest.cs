using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Validation;

namespace CyberSoc.Api.Contracts.Soc;

/// <summary>Explicit fields accepted by PatchIncidentRequest; unknown JSON properties are rejected.</summary>
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class PatchIncidentRequest : IValidatableObject
{
    /// <summary>Title.</summary>
    [StringLength(250), NotBlank]
    public string? Title { get; set { field = value; TitleSpecified = true; } }
    internal bool TitleSpecified { get; private set; }
    /// <summary>Description.</summary>
    [StringLength(4000), NotBlank]
    public string? Description { get; set { field = value; DescriptionSpecified = true; } }
    internal bool DescriptionSpecified { get; private set; }
    /// <summary>Severity.</summary>
    [EnumDataType(typeof(Severity))]
    public Severity? Severity { get; set { field = value; SeveritySpecified = true; } }
    internal bool SeveritySpecified { get; private set; }
    /// <summary>Status.</summary>
    [EnumDataType(typeof(IncidentStatus))]
    public IncidentStatus? Status { get; set { field = value; StatusSpecified = true; } }
    internal bool StatusSpecified { get; private set; }
    /// <summary>AssignedUserId.</summary>
    [NotEmptyGuid]
    public Guid? AssignedUserId { get; set { field = value; AssignedUserIdSpecified = true; } }
    internal bool AssignedUserIdSpecified { get; private set; }
    /// <inheritdoc />
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (!(TitleSpecified || DescriptionSpecified || SeveritySpecified || StatusSpecified || AssignedUserIdSpecified)) yield return new ValidationResult("Supply at least one mutable field.");
        if (TitleSpecified && Title is null) yield return new ValidationResult("Title cannot be null.", [nameof(Title)]);
        if (DescriptionSpecified && Description is null) yield return new ValidationResult("Description cannot be null.", [nameof(Description)]);
        if (SeveritySpecified && Severity is null) yield return new ValidationResult("Severity cannot be null.", [nameof(Severity)]);
        if (StatusSpecified && Status is null) yield return new ValidationResult("Status cannot be null.", [nameof(Status)]);
        yield break;
    }
}
