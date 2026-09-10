using CyberSoc.Api.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace CyberSoc.Api.Authentication;

/// <summary>Uses ASP.NET Core Identity's salted PBKDF2 password hasher.</summary>
public sealed class PasswordService : IPasswordService
{
    private readonly PasswordHasher<User> hasher = new();
    private readonly User dummy = new() { Email = "timing-workload@example.invalid", DisplayName = "", PasswordHash = "" };

    /// <summary>Creates an in-memory dummy hash for missing-account verification work.</summary>
    public PasswordService()
    {
        dummy.PasswordHash = hasher.HashPassword(dummy, Guid.NewGuid().ToString());
    }

    /// <inheritdoc />
    public string Hash(User user, string password) => hasher.HashPassword(user, password);

    /// <inheritdoc />
    public PasswordVerificationResult Verify(User user, string password)
    {
        try
        {
            return hasher.VerifyHashedPassword(user, user.PasswordHash, password);
        }
        catch (FormatException)
        {
            return PasswordVerificationResult.Failed;
        }
    }

    /// <inheritdoc />
    public void VerifyMissingUser(string password) => hasher.VerifyHashedPassword(dummy, dummy.PasswordHash, password);
}
