using System.Security.Claims;
using CyberSoc.Api.Application;
using CyberSoc.Api.Authorization;
using CyberSoc.Api.Contracts.Soar;
using CyberSoc.Api.Validation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CyberSoc.Api.Controllers;

/// <summary>Simulation-only SOAR audit endpoints; no real response action is executed.</summary>
[ApiController]
[Route("api/alerts/{alertId:guid}/response-actions")]
[Authorize(Policy = SocPolicies.SocOperations)]
public sealed class SimulatedResponseActionsController(
    SimulatedSoarService service) : ControllerBase
{
    /// <summary>Lists immutable simulated response records for an alert.</summary>
    [HttpGet]
    public Task<IReadOnlyList<SimulatedResponseActionResponse>> List(
        [NotEmptyGuid] Guid alertId,
        CancellationToken ct) =>
        service.ListAsync(alertId, ct);

    /// <summary>
    /// Records a safe response simulation. Administrator authorization is required.
    /// </summary>
    [HttpPost]
    [Authorize(Policy = SocPolicies.AdminOnly)]
    [ProducesResponseType<SimulatedResponseActionResponse>(
        StatusCodes.Status201Created)]
    public async Task<ActionResult<SimulatedResponseActionResponse>> Create(
        [NotEmptyGuid] Guid alertId,
        CreateSimulatedResponseActionRequest request,
        CancellationToken ct)
    {
        var actorId = Guid.Parse(User.FindFirstValue("sub")!);
        var response = await service.CreateAsync(alertId, actorId, request, ct);

        return Created(
            $"/api/alerts/{alertId}/response-actions",
            response);
    }
}
