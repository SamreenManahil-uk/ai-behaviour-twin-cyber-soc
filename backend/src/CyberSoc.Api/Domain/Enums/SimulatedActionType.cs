namespace CyberSoc.Api.Domain.Enums;

/// <summary>Strict allow-list of safe simulated SOC response actions.</summary>
public enum SimulatedActionType
{
    /// <summary>Simulate endpoint isolation.</summary>
    IsolateEndpoint,

    /// <summary>Simulate blocking one IP address.</summary>
    BlockIpAddress,

    /// <summary>Simulate process termination.</summary>
    TerminateProcess,

    /// <summary>Simulate account disablement.</summary>
    DisableAccount,

    /// <summary>Simulate forensic evidence collection.</summary>
    CollectForensics
}
