namespace CyberSoc.Api.Configuration;

/// <summary>Configuration for the private internal Python ML service.</summary>
public sealed class MlServiceOptions
{
    /// <summary>Configuration section name.</summary>
    public const string SectionName = "MlService";

    /// <summary>Internal FastAPI base URL, supplied through configuration.</summary>
    public string BaseUrl { get; init; } = string.Empty;

    /// <summary>Maximum inference request duration.</summary>
    public int TimeoutSeconds { get; init; } = 10;
}
