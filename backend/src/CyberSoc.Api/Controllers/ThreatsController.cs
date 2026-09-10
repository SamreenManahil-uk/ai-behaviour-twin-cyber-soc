using CyberSoc.Api.Application;
using CyberSoc.Api.Authorization;
using CyberSoc.Api.Contracts.Common;
using CyberSoc.Api.Contracts.Soc;
using CyberSoc.Api.Validation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CyberSoc.Api.Controllers;

/// <summary>Authorized threats REST resources.</summary>
[ApiController]
[Route("api/threats")]
[Authorize(Policy = SocPolicies.SocOperations)]
[RequestSizeLimit(300000)]
public sealed class ThreatsController(ThreatService service) : ControllerBase
{
    /// <summary>Lists filtered and paginated threats.</summary>
    [HttpGet]
    public Task<PageResponse<ThreatResponse>> List([FromQuery] ThreatQuery query, CancellationToken ct) => service.ListAsync(query, ct);

    /// <summary>Returns one resource or HTTP 404.</summary>
    [HttpGet("{id}")]
    public Task<ThreatResponse> Get([NotEmptyGuid] Guid id, CancellationToken ct) => service.GetAsync(id, ct);

    /// <summary>Creates a resource with a server-generated identifier.</summary>
    [HttpPost]
    [Authorize(Policy = SocPolicies.AdminOnly)]
    [ProducesResponseType<ThreatResponse>(StatusCodes.Status201Created)]
    public async Task<ActionResult<ThreatResponse>> Create(CreateThreatRequest request, CancellationToken ct)
    {
        var response = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
    }

    /// <summary>Updates only explicitly supplied mutable fields.</summary>
    [HttpPatch("{id}")]
    [Authorize(Policy = SocPolicies.AdminOnly)]
    public Task<ThreatResponse> Patch([NotEmptyGuid] Guid id, PatchThreatRequest request, CancellationToken ct) => service.PatchAsync(id, request, ct);
}
