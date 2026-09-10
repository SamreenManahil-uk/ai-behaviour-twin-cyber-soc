namespace CyberSoc.Api.Integration.Ml;

/// <summary>A safe error suitable for translation to an API ProblemDetails response.</summary>
public sealed class MlServiceException(int statusCode, string title)
    : Exception(title)
{
    /// <summary>Safe HTTP status code for the public API response.</summary>
    public int StatusCode { get; } = statusCode;

    /// <summary>Safe ProblemDetails title without internal service information.</summary>
    public string Title { get; } = title;
}
