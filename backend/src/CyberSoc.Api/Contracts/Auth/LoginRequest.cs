using System.ComponentModel.DataAnnotations;

namespace CyberSoc.Api.Contracts.Auth;

/// <summary>Login credentials; never log or echo this request.</summary>
public sealed class LoginRequest
{
    /// <summary>Account email, normalized by the authentication service.</summary>
    [Required, EmailAddress, StringLength(320)]
    public required string Email { get; init; }

    /// <summary>Supplied password used only for hash verification.</summary>
    [Required, StringLength(1024)]
    public required string Password { get; init; }
}
