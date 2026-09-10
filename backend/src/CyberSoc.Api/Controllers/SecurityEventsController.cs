using CyberSoc.Api.Application;
using CyberSoc.Api.Authorization;
using CyberSoc.Api.Contracts.Common;
using CyberSoc.Api.Contracts.Soc;
using CyberSoc.Api.Validation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CyberSoc.Api.Controllers;

/// <summary>Authorized events REST resources.</summary>
[ApiController]
[Route("api/events")]
[Authorize(Policy = SocPolicies.SocOperations)]
[RequestSizeLimit(300000)]
public sealed class SecurityEventsController(EventService service) : ControllerBase
{
    /// <summary>Lists filtered and paginated events.</summary>
    [HttpGet]
    public Task<PageResponse<EventResponse>> List([FromQuery] EventQuery query, CancellationToken ct) => service.ListAsync(query, ct);

    /// <summary>Returns one resource or HTTP 404.</summary>
    [HttpGet("{id}")]
    public Task<EventResponse> Get([NotEmptyGuid] Guid id, CancellationToken ct) => service.GetAsync(id, ct);

    /// <summary>Creates a resource with a server-generated identifier.</summary>
    [HttpPost]
    [ProducesResponseType<EventResponse>(StatusCodes.Status201Created)]
    public async Task<ActionResult<EventResponse>> Create(CreateEventRequest request, CancellationToken ct)
    {
        var response = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = response.Id }, response);
    }
}
