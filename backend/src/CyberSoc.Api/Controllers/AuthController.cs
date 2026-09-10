using System.Security.Claims;
using CyberSoc.Api.Authentication;
using CyberSoc.Api.Authorization;
using CyberSoc.Api.Contracts.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CyberSoc.Api.Controllers;

/// <summary>Credential exchange and trusted token identity.</summary>
[ApiController]
[Route("api/auth")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public sealed class AuthController : ControllerBase
{
    /// <summary>Authenticates an active account and issues a short-lived bearer token.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType<LoginResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, [FromServices] LoginService service, CancellationToken cancellationToken)
    {
        var response = await service.LoginAsync(request, cancellationToken);
        return response is null
            ? Unauthorized(new ProblemDetails { Status = 401, Title = "Authentication failed", Detail = "Invalid email or password.", Type = "https://www.rfc-editor.org/rfc/rfc9110.html#section-15.5.2" })
            : Ok(response);
    }

    /// <summary>Returns public identity from validated token claims without a database lookup.</summary>
    [HttpGet("me")]
    [Authorize(Policy = SocPolicies.SocOperations)]
    [ProducesResponseType<AuthUserResponse>(StatusCodes.Status200OK)]
    public ActionResult<AuthUserResponse> Me() => Ok(new AuthUserResponse(
        Guid.Parse(User.FindFirstValue("sub")!), User.FindFirstValue("email")!,
        User.FindFirstValue("name")!, User.FindFirstValue("role")!));
}
