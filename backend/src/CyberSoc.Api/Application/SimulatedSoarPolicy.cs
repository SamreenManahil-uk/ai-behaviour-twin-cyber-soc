using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Validation;

namespace CyberSoc.Api.Application;

/// <summary>Pure validation and normalization for simulation-only response targets.</summary>
public static class SimulatedSoarPolicy
{
    /// <summary>Returns a trusted target or throws when input violates the allow-list.</summary>
    public static string NormalizeTarget(
        SimulatedActionType actionType,
        string? suppliedTarget,
        string endpointHostname)
    {
        if (!Enum.IsDefined(actionType))
        {
            throw new ArgumentException("Unknown simulated action type.");
        }

        if (actionType is SimulatedActionType.IsolateEndpoint or
            SimulatedActionType.CollectForensics)
        {
            if (!string.IsNullOrWhiteSpace(suppliedTarget))
            {
                throw new ArgumentException(
                    "Endpoint-based actions derive their target from the alert; target must be omitted.");
            }

            return endpointHostname;
        }

        var target = suppliedTarget?.Trim();
        if (string.IsNullOrWhiteSpace(target))
        {
            throw new ArgumentException("A target is required for this simulated action.");
        }

        return actionType switch
        {
            SimulatedActionType.BlockIpAddress when SocInput.IsIp(target) =>
                target,

            SimulatedActionType.TerminateProcess
                when IsSafeText(target, 512) =>
                target,

            SimulatedActionType.DisableAccount
                when IsSafeText(target, 256) =>
                target,

            SimulatedActionType.BlockIpAddress =>
                throw new ArgumentException("Target must be a valid IPv4 or IPv6 address."),

            SimulatedActionType.TerminateProcess =>
                throw new ArgumentException("Process target is invalid or too long."),

            SimulatedActionType.DisableAccount =>
                throw new ArgumentException("Account target is invalid or too long."),

            _ => throw new ArgumentException("Unsupported simulated action.")
        };
    }

    private static bool IsSafeText(string value, int maximumLength) =>
        value.Length <= maximumLength && !value.Any(char.IsControl);
}
