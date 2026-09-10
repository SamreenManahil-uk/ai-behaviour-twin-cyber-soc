using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CyberSoc.Api.Configuration;

/// <summary>JWT settings supplied through configuration; signing material must be external.</summary>
public sealed class JwtOptions
{
    /// <summary>Expected token issuer.</summary>
    public string Issuer { get; set; } = "";
    /// <summary>Expected token audience.</summary>
    public string Audience { get; set; } = "";
    /// <summary>External UTF-8 signing material of at least 32 bytes.</summary>
    public string SigningKey { get; set; } = "";
    /// <summary>Token lifetime in minutes, from 1 to 60.</summary>
    public int AccessTokenMinutes { get; set; } = 15;

    /// <summary>Strict validation rules shared by issuance configuration and bearer authentication.</summary>
    public TokenValidationParameters CreateValidationParameters() => new()
    {
        ValidateIssuer = true,
        ValidIssuer = Issuer,
        ValidateAudience = true,
        ValidAudience = Audience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey)),
        RequireSignedTokens = true,
        RequireExpirationTime = true,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
        ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
        NameClaimType = "name",
        RoleClaimType = "role"
    };
}

internal sealed class JwtOptionsValidator : IValidateOptions<JwtOptions>
{
    public ValidateOptionsResult Validate(string? name, JwtOptions options)
    {
        if (string.IsNullOrWhiteSpace(options.Issuer) || string.IsNullOrWhiteSpace(options.Audience))
        {
            return ValidateOptionsResult.Fail("Jwt:Issuer and Jwt:Audience are required.");
        }

        if (string.IsNullOrWhiteSpace(options.SigningKey) || Encoding.UTF8.GetByteCount(options.SigningKey) < 32)
        {
            return ValidateOptionsResult.Fail("Jwt:SigningKey must contain at least 32 UTF-8 bytes of external signing material.");
        }

        return options.AccessTokenMinutes is >= 1 and <= 60
            ? ValidateOptionsResult.Success
            : ValidateOptionsResult.Fail("Jwt:AccessTokenMinutes must be between 1 and 60.");
    }
}
