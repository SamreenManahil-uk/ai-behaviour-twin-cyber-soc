using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Domain.Entities;

/// <summary>
/// Immutable audit record for a simulated response. It never represents a real
/// endpoint, network, process or account operation.
/// </summary>
public sealed class SimulatedResponseAction
{
    /// <summary>Record identifier.</summary>
    public Guid Id { get; set; }

    /// <summary>Associated alert identifier.</summary>
    public Guid AlertId { get; set; }

    /// <summary>Associated endpoint identifier.</summary>
    public Guid EndpointId { get; set; }

    /// <summary>Authenticated user who requested the simulation.</summary>
    public Guid RequestedByUserId { get; set; }

    /// <summary>Allow-listed simulated action.</summary>
    public SimulatedActionType ActionType { get; set; }

    /// <summary>Validated fictional or alert-derived target.</summary>
    public required string Target { get; set; }

    /// <summary>Analyst justification.</summary>
    public required string Reason { get; set; }

    /// <summary>Simulation completion status.</summary>
    public SimulatedActionStatus Status { get; set; }

    /// <summary>Transparent simulation result.</summary>
    public required string ResultSummary { get; set; }

    /// <summary>Must always remain true.</summary>
    public bool IsSimulation { get; set; } = true;

    /// <summary>Server-generated UTC request time.</summary>
    public DateTimeOffset RequestedAtUtc { get; set; }

    /// <summary>Server-generated UTC completion time.</summary>
    public DateTimeOffset CompletedAtUtc { get; set; }
}
