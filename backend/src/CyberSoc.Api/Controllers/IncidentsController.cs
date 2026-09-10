using CyberSoc.Api.Application;
using CyberSoc.Api.Authorization;
using CyberSoc.Api.Contracts.Common;
using CyberSoc.Api.Contracts.Soc;
using CyberSoc.Api.Validation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CyberSoc.Api.Controllers;

/// <summary>Authorized incidents REST resources.</summary>
[ApiController]
[Route("api/incidents")]
[Authorize(Policy = SocPolicies.SocOperations)]
[RequestSizeLimit(300000)]
public sealed class IncidentsController(IncidentService service) : ControllerBase
{
    /// <summary>Lists filtered and paginated incidents.</summary>
    [HttpGet]
    public Task<PageResponse<IncidentResponse>> List([FromQuery] IncidentQuery query, CancellationToken ct) => service.ListAsync(query, ct);

    /// <summary>Returns one resource or HTTP 404.</summary>
    [HttpGet("{id}")]
    public Task<IncidentDetailResponse> Get([NotEmptyGuid] Guid id, CancellationToken ct) => service.GetAsync(id, ct);

    /// <summary>Creates a resource with a server-generated identifier.</summary>
    [HttpPost]
    [ProducesResponseType<IncidentResponse>(StatusCodes.Status201Created)]
    public async Task<ActionResult<IncidentResponse>> Create(CreateIncidentRequest request, CancellationToken ct)
    {
        var response = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
    }

    /// <summary>Updates only explicitly supplied mutable fields.</summary>
    [HttpPatch("{id}")]
    public Task<IncidentResponse> Patch([NotEmptyGuid] Guid id, PatchIncidentRequest request, CancellationToken ct) => service.PatchAsync(id, request, ct);
}
