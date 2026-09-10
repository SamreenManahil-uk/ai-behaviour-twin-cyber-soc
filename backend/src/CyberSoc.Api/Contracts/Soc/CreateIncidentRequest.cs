using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Validation;

namespace CyberSoc.Api.Contracts.Soc;

/// <summary>Explicit fields accepted by CreateIncidentRequest; unknown JSON properties are rejected.</summary>
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class CreateIncidentRequest : IValidatableObject
{
    /// <summary>Title.</summary>
    [Required, StringLength(250), NotBlank]
    public required string Title { get; init; }
    /// <summary>Description.</summary>
    [Required, StringLength(4000), NotBlank]
    public required string Description { get; init; }
    /// <summary>Severity.</summary>
    [EnumDataType(typeof(Severity))]
    public required Severity Severity { get; init; }
    /// <summary>AssignedUserId.</summary>
    [NotEmptyGuid]
    public Guid? AssignedUserId { get; init; }
    /// <summary>AlertIds.</summary>
    [MaxLength(100)]
    public Guid[]? AlertIds { get; init; }
    /// <inheritdoc />
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (AlertIds is not null && (AlertIds.Contains(Guid.Empty) || AlertIds.Distinct().Count() != AlertIds.Length)) yield return new ValidationResult("Alert ids must be unique nonempty UUIDs.", [nameof(AlertIds)]);
        yield break;
    }
}
