using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Validation;

namespace CyberSoc.Api.Contracts.Soc;

/// <summary>Explicit fields accepted by PatchEndpointRequest; unknown JSON properties are rejected.</summary>
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class PatchEndpointRequest : IValidatableObject
{
    /// <summary>Status.</summary>
    [EnumDataType(typeof(EndpointStatus))]
    public EndpointStatus? Status { get; set { field = value; StatusSpecified = true; } }
    internal bool StatusSpecified { get; private set; }
    /// <summary>AgentVersion.</summary>
    [StringLength(100), NotBlank]
    public string? AgentVersion { get; set { field = value; AgentVersionSpecified = true; } }
    internal bool AgentVersionSpecified { get; private set; }
    /// <summary>IpAddress.</summary>
    [StringLength(45), IpAddress]
    public string? IpAddress { get; set { field = value; IpAddressSpecified = true; } }
    internal bool IpAddressSpecified { get; private set; }
    /// <summary>LastSeenAtUtc.</summary>
    [Utc]
    public DateTimeOffset? LastSeenAtUtc { get; set { field = value; LastSeenAtUtcSpecified = true; } }
    internal bool LastSeenAtUtcSpecified { get; private set; }
    /// <inheritdoc />
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (!(StatusSpecified || AgentVersionSpecified || IpAddressSpecified || LastSeenAtUtcSpecified)) yield return new ValidationResult("Supply at least one mutable field.");
        if (StatusSpecified && Status is null) yield return new ValidationResult("Status cannot be null.", [nameof(Status)]);
        if (LastSeenAtUtcSpecified && LastSeenAtUtc is null) yield return new ValidationResult("LastSeenAtUtc cannot be null.", [nameof(LastSeenAtUtc)]);
        yield break;
    }
}
