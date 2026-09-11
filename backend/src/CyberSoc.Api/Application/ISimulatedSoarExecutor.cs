using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Application;

/// <summary>
/// Simulation-only boundary. Implementations must not perform operating-system,
/// account, process, firewall or network actions.
/// </summary>
public interface ISimulatedSoarExecutor
{
    /// <summary>Returns a deterministic description of what would have been requested.</summary>
    string Simulate(SimulatedActionType actionType, string target);
}
