using CyberSoc.Api.Contracts.Auth;
using Microsoft.AspNetCore.Identity;

namespace CyberSoc.Api.Authentication;

/// <summary>Coordinates account lookup, password verification, optional rehash, and token issuance.</summary>
public sealed class LoginService(IAuthUserStore users, IPasswordService passwords, JwtTokenService tokens, TimeProvider clock)
{
    /// <summary>Returns credentials only for a valid active account; all credential failures return null.</summary>
    public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await users.FindActiveAsync(request.Email.Trim().ToUpperInvariant(), cancellationToken);
        if (user is null || !user.IsActive)
        {
            passwords.VerifyMissingUser(request.Password);
            return null;
        }

        var result = passwords.Verify(user, request.Password);
        if (result == PasswordVerificationResult.Failed || !Enum.IsDefined(user.Role))
        {
            return null;
        }

        if (result == PasswordVerificationResult.SuccessRehashNeeded &&
            !await users.TryUpgradeHashAsync(user, passwords.Hash(user, request.Password), clock.GetUtcNow(), cancellationToken))
        {
            return null;
        }

        return tokens.Issue(user);
    }
}
