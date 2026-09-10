using CyberSoc.Api.Domain.Entities;

namespace CyberSoc.Api.Authentication;

/// <summary>Narrow persistence operations required by login.</summary>
public interface IAuthUserStore
{
    /// <summary>Finds an active account by normalized email.</summary>
    Task<User?> FindActiveAsync(string normalizedEmail, CancellationToken cancellationToken);
    /// <summary>Replaces a stale hash only if the account remains active and its hash is unchanged.</summary>
    Task<bool> TryUpgradeHashAsync(User user, string newHash, DateTimeOffset updatedAtUtc, CancellationToken cancellationToken);
}
