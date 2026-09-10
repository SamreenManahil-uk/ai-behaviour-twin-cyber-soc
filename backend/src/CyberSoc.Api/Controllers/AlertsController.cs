using CyberSoc.Api.Application;
using CyberSoc.Api.Authorization;
using CyberSoc.Api.Contracts.Common;
using CyberSoc.Api.Contracts.Soc;
using CyberSoc.Api.Validation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CyberSoc.Api.Controllers;

/// <summary>Authorized alerts REST resources.</summary>
[ApiController]
[Route("api/alerts")]
[Authorize(Policy = SocPolicies.SocOperations)]
[RequestSizeLimit(300000)]
public sealed class AlertsController(AlertService service) : ControllerBase
{
    /// <summary>Lists filtered and paginated alerts.</summary>
    [HttpGet]
    public Task<PageResponse<AlertResponse>> List([FromQuery] AlertQuery query, CancellationToken ct) => service.ListAsync(query, ct);

    /// <summary>Returns one resource or HTTP 404.</summary>
    [HttpGet("{id}")]
    public Task<AlertDetailResponse> Get([NotEmptyGuid] Guid id, CancellationToken ct) => service.GetAsync(id, ct);

    /// <summary>Updates only explicitly supplied mutable fields.</summary>
    [HttpPatch("{id}")]
    public Task<AlertResponse> Patch([NotEmptyGuid] Guid id, PatchAlertRequest request, CancellationToken ct) => service.PatchAsync(id, request, ct);
}
