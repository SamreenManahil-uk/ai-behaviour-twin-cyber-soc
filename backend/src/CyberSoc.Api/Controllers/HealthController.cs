using System.Reflection;
using CyberSoc.Api.Contracts.Health;
using Microsoft.AspNetCore.Mvc;

namespace CyberSoc.Api.Controllers;

/// <summary>Exposes service liveness information.</summary>
[ApiController]
[Route("api/health")]
[Produces("application/json")]
public sealed class HealthController : ControllerBase
{
    private static readonly string ServiceVersion = typeof(HealthController).Assembly
        .GetCustomAttribute<AssemblyInformationalVersionAttribute>()!.InformationalVersion;

    /// <summary>Returns the API status, version, and current UTC timestamp.</summary>
    /// <returns>The live API's health information.</returns>
    [HttpGet]
    [ProducesResponseType<HealthResponse>(StatusCodes.Status200OK)]
    public ActionResult<HealthResponse> Get()
    {
        return Ok(new HealthResponse("healthy", "CyberSoc.Api", ServiceVersion, DateTimeOffset.UtcNow));
    }
}
