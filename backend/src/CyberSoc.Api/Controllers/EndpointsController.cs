using CyberSoc.Api.Application;
using CyberSoc.Api.Authorization;
using CyberSoc.Api.Contracts.Common;
using CyberSoc.Api.Contracts.Soc;
using CyberSoc.Api.Validation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CyberSoc.Api.Controllers;

/// <summary>Authorized endpoints REST resources.</summary>
[ApiController]
[Route("api/endpoints")]
[Authorize(Policy = SocPolicies.SocOperations)]
[RequestSizeLimit(300000)]
public sealed class EndpointsController(EndpointService service) : ControllerBase
{
    /// <summary>Lists filtered and paginated endpoints.</summary>
    [HttpGet]
    public Task<PageResponse<EndpointResponse>> List([FromQuery] EndpointQuery query, CancellationToken ct) => service.ListAsync(query, ct);

    /// <summary>Returns one resource or HTTP 404.</summary>
    [HttpGet("{id}")]
    public Task<EndpointResponse> Get([NotEmptyGuid] Guid id, CancellationToken ct) => service.GetAsync(id, ct);

    /// <summary>Creates a resource with a server-generated identifier.</summary>
    [HttpPost]
    [Authorize(Policy = SocPolicies.AdminOnly)]
    [ProducesResponseType<EndpointResponse>(StatusCodes.Status201Created)]
    public async Task<ActionResult<EndpointResponse>> Create(CreateEndpointRequest request, CancellationToken ct)
    {
        var response = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
    }

    /// <summary>Updates only explicitly supplied mutable fields.</summary>
    [HttpPatch("{id}")]
    [Authorize(Policy = SocPolicies.AdminOnly)]
    public Task<EndpointResponse> Patch([NotEmptyGuid] Guid id, PatchEndpointRequest request, CancellationToken ct) => service.PatchAsync(id, request, ct);
}
