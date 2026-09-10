using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Validation;

namespace CyberSoc.Api.Contracts.Soc;

/// <summary>Explicit fields accepted by CreateEventRequest; unknown JSON properties are rejected.</summary>
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class CreateEventRequest : IValidatableObject
{
    /// <summary>EndpointId.</summary>
    [NotEmptyGuid]
    public required Guid EndpointId { get; init; }
    /// <summary>EventType.</summary>
    [Required, StringLength(100), NotBlank]
    public required string EventType { get; init; }
    /// <summary>Source.</summary>
    [Required, StringLength(200), NotBlank]
    public required string Source { get; init; }
    /// <summary>EventTimestampUtc.</summary>
    [Utc]
    public required DateTimeOffset EventTimestampUtc { get; init; }
    /// <summary>Severity.</summary>
    [EnumDataType(typeof(Severity))]
    public required Severity Severity { get; init; }
    /// <summary>ProcessName.</summary>
    [StringLength(512), NotBlank]
    public string? ProcessName { get; init; }
    /// <summary>UserName.</summary>
    [StringLength(256), NotBlank]
    public string? UserName { get; init; }
    /// <summary>SourceIp.</summary>
    [StringLength(45), IpAddress]
    public string? SourceIp { get; init; }
    /// <summary>DestinationIp.</summary>
    [StringLength(45), IpAddress]
    public string? DestinationIp { get; init; }
    /// <summary>RawPayload.</summary>
    [Required, JsonPayload]
    public required string RawPayload { get; init; }
    /// <inheritdoc />
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        yield break;
    }
}
