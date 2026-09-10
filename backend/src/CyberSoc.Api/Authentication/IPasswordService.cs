using CyberSoc.Api.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace CyberSoc.Api.Authentication;

/// <summary>Vetted password hashing and verification boundary.</summary>
public interface IPasswordService
{
    /// <summary>Creates an encoded, salted password hash.</summary>
    string Hash(User user, string password);
    /// <summary>Verifies a hash, retaining the built-in rehash-needed result.</summary>
    PasswordVerificationResult Verify(User user, string password);
    /// <summary>Performs a comparable verification workload for missing or inactive accounts.</summary>
    void VerifyMissingUser(string password);
}
