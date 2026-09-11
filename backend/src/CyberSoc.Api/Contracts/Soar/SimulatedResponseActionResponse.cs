using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Contracts.Soar;

/// <summary>Safe public representation of a simulated response audit record.</summary>
/// <param name="Id">Audit record identifier.</param>
/// <param name="AlertId">Associated alert.</param>
/// <param name="EndpointId">Associated endpoint.</param>
/// <param name="RequestedByUserId">Authenticated requester.</param>
/// <param name="ActionType">Simulated action type.</param>
/// <param name="Target">Validated target.</param>
/// <param name="Reason">Analyst justification.</param>
/// <param name="Status">Simulation status.</param>
/// <param name="ResultSummary">Explicit simulation-only result.</param>
/// <param name="IsSimulation">Always true.</param>
/// <param name="RequestedAtUtc">Server request time.</param>
/// <param name="CompletedAtUtc">Server completion time.</param>
public sealed record SimulatedResponseActionResponse(
    Guid Id,
    Guid AlertId,
    Guid EndpointId,
    Guid RequestedByUserId,
    SimulatedActionType ActionType,
    string Target,
    string Reason,
    SimulatedActionStatus Status,
    string ResultSummary,
    bool IsSimulation,
    DateTimeOffset RequestedAtUtc,
    DateTimeOffset CompletedAtUtc);
