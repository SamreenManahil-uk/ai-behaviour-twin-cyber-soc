using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Validation;

namespace CyberSoc.Api.Contracts.Soar;

/// <summary>Request for a safe, recorded simulation—not a real endpoint action.</summary>
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed class CreateSimulatedResponseActionRequest
{
    /// <summary>Allow-listed action to simulate.</summary>
    [EnumDataType(typeof(SimulatedActionType))]
    public required SimulatedActionType ActionType { get; init; }

    /// <summary>
    /// Required for IP, process and account actions. Endpoint-based action targets
    /// are derived from the alert and this field must be omitted.
    /// </summary>
    [StringLength(512)]
    [NotBlank]
    public string? Target { get; init; }

    /// <summary>Human justification retained in the audit trail.</summary>
    [Required]
    [StringLength(1000, MinimumLength = 10)]
    [NotBlank]
    public required string Reason { get; init; }
}
