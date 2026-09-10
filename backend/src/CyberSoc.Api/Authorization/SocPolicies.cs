namespace CyberSoc.Api.Authorization;

/// <summary>Authorization policy names for SOC operations.</summary>
public static class SocPolicies
{
    /// <summary>Administrator access only.</summary>
    public const string AdminOnly = "AdminOnly";
    /// <summary>Administrator or SOC analyst access.</summary>
    public const string SocOperations = "SocOperations";
}
