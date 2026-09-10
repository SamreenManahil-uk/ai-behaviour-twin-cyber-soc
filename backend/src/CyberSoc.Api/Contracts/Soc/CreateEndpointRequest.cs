using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Validation;

namespace CyberSoc.Api.Contracts.Soc;

/// <summary>Explicit fields accepted by CreateEndpointRequest; unknown JSON properties are rejected.</summary>
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class CreateEndpointRequest : IValidatableObject
{
    /// <summary>Hostname.</summary>
    [Required, StringLength(253), NotBlank]
    public required string Hostname { get; init; }
    /// <summary>OperatingSystem.</summary>
    [EnumDataType(typeof(EndpointOperatingSystem))]
    public required EndpointOperatingSystem OperatingSystem { get; init; }
    /// <summary>IpAddress.</summary>
    [StringLength(45), IpAddress]
    public string? IpAddress { get; init; }
    /// <summary>AgentVersion.</summary>
    [StringLength(100), NotBlank]
    public string? AgentVersion { get; init; }
    /// <inheritdoc />
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (!SocInput.IsHostname(SocInput.Hostname(Hostname))) yield return new ValidationResult("Invalid hostname.", [nameof(Hostname)]);
        yield break;
    }
}
