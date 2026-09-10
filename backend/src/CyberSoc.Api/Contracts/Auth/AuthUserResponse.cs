namespace CyberSoc.Api.Contracts.Auth;

/// <summary>Public account identity; contains no credential material.</summary>
/// <param name="Id">Account identifier.</param>
/// <param name="Email">Normalized account email.</param>
/// <param name="DisplayName">Display name.</param>
/// <param name="Role">Role name matching the persisted UserRole member.</param>
public sealed record AuthUserResponse(Guid Id, string Email, string DisplayName, string Role);
