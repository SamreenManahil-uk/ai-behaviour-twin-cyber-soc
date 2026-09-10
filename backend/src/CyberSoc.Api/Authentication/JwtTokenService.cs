using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CyberSoc.Api.Configuration;
using CyberSoc.Api.Contracts.Auth;
using CyberSoc.Api.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CyberSoc.Api.Authentication;

/// <summary>Issues minimal HS256 access tokens with UTC expiration.</summary>
public sealed class JwtTokenService(IOptions<JwtOptions> options, TimeProvider clock)
{
    /// <summary>Creates a short-lived token for an authenticated active account.</summary>
    public LoginResponse Issue(User user)
    {
        var settings = options.Value;
        var now = clock.GetUtcNow();
        var expires = DateTimeOffset.FromUnixTimeSeconds(now.AddMinutes(settings.AccessTokenMinutes).ToUnixTimeSeconds());
        var identity = new AuthUserResponse(user.Id, user.Email, user.DisplayName, user.Role.ToString());
        var token = new JwtSecurityToken(settings.Issuer, settings.Audience,
            [new Claim("sub", user.Id.ToString()), new Claim("email", user.Email),
             new Claim("name", user.DisplayName), new Claim("role", user.Role.ToString()),
             new Claim("jti", Guid.NewGuid().ToString())],
            now.UtcDateTime, expires.UtcDateTime,
            new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.SigningKey)), SecurityAlgorithms.HmacSha256));
        return new LoginResponse(new JwtSecurityTokenHandler().WriteToken(token), "Bearer", expires, identity);
    }
}
