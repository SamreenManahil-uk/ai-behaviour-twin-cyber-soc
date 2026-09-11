using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Application;

/// <summary>
/// Generates audit text only. This class contains no shell, process, firewall,
/// directory-service, remote-management or endpoint-agent integration.
/// </summary>
public sealed class SimulatedSoarExecutor : ISimulatedSoarExecutor
{
    /// <inheritdoc />
    public string Simulate(SimulatedActionType actionType, string target) =>
        actionType switch
        {
            SimulatedActionType.IsolateEndpoint =>
                $"SIMULATION ONLY: endpoint isolation would be requested for '{target}'. No endpoint was changed.",

            SimulatedActionType.BlockIpAddress =>
                $"SIMULATION ONLY: IP blocking would be requested for '{target}'. No firewall was changed.",

            SimulatedActionType.TerminateProcess =>
                $"SIMULATION ONLY: process termination would be requested for '{target}'. No process was stopped.",

            SimulatedActionType.DisableAccount =>
                $"SIMULATION ONLY: account disablement would be requested for '{target}'. No account was changed.",

            SimulatedActionType.CollectForensics =>
                $"SIMULATION ONLY: forensic collection would be requested for '{target}'. No device was accessed.",

            _ => throw new ArgumentOutOfRangeException(
                nameof(actionType),
                "Unknown simulated action type.")
        };
}
