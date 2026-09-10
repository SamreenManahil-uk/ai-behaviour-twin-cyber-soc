using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Validation;

namespace CyberSoc.Api.Contracts.Soc;

/// <summary>Explicit fields accepted by PatchAlertRequest; unknown JSON properties are rejected.</summary>
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class PatchAlertRequest : IValidatableObject
{
    /// <summary>Status.</summary>
    [EnumDataType(typeof(AlertStatus))]
    public required AlertStatus Status { get; init; }
    /// <inheritdoc />
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        yield break;
    }
}
