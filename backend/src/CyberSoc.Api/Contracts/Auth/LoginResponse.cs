namespace CyberSoc.Api.Contracts.Auth;

/// <summary>Short-lived bearer credentials. Must not be logged or cached.</summary>
/// <param name="AccessToken">Signed JWT.</param>
/// <param name="TokenType">Bearer.</param>
/// <param name="ExpiresAtUtc">UTC expiration instant.</param>
/// <param name="User">Public account identity.</param>
public sealed record LoginResponse(string AccessToken, string TokenType, DateTimeOffset ExpiresAtUtc, AuthUserResponse User);
