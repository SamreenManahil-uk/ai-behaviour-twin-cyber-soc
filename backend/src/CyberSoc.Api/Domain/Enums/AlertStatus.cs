namespace CyberSoc.Api.Domain.Enums;

/// <summary>Supported AlertStatus values.</summary>
public enum AlertStatus
{
    /// <summary>New.</summary>
    New,
    /// <summary>Investigating.</summary>
    Investigating,
    /// <summary>Contained.</summary>
    Contained,
    /// <summary>Resolved.</summary>
    Resolved,
    /// <summary>FalsePositive.</summary>
    FalsePositive,
}
