namespace CyberSoc.Api.Contracts.Health;

/// <summary>Reports service liveness; it does not check external dependencies.</summary>
/// <param name="Status">Current service status.</param>
/// <param name="Service">Name of the responding service.</param>
/// <param name="Version">Application version defined by the API project.</param>
/// <param name="Timestamp">UTC time at which the response was created.</param>
public sealed record HealthResponse(string Status, string Service, string Version, DateTimeOffset Timestamp);
