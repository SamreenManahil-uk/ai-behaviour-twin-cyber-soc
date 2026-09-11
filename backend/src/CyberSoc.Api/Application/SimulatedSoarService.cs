using CyberSoc.Api.Contracts.Soar;
using CyberSoc.Api.Data;
using CyberSoc.Api.Domain.Entities;
using CyberSoc.Api.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CyberSoc.Api.Application;

/// <summary>Creates and reads immutable simulation-only response audit records.</summary>
public sealed class SimulatedSoarService(
    CyberSocDbContext db,
    TimeProvider clock,
    ISimulatedSoarExecutor executor)
{
    /// <summary>Lists immutable response records for an existing alert.</summary>
    public async Task<IReadOnlyList<SimulatedResponseActionResponse>> ListAsync(
        Guid alertId,
        CancellationToken ct)
    {
        if (!await db.Alerts.AsNoTracking().AnyAsync(x => x.Id == alertId, ct))
        {
            throw SocRequestException.Missing();
        }

        return await db.SimulatedResponseActions
            .AsNoTracking()
            .Where(x => x.AlertId == alertId)
            .OrderByDescending(x => x.RequestedAtUtc)
            .ThenBy(x => x.Id)
            .Select(x => new SimulatedResponseActionResponse(
                x.Id,
                x.AlertId,
                x.EndpointId,
                x.RequestedByUserId,
                x.ActionType,
                x.Target,
                x.Reason,
                x.Status,
                x.ResultSummary,
                x.IsSimulation,
                x.RequestedAtUtc,
                x.CompletedAtUtc))
            .ToListAsync(ct);
    }

    /// <summary>Records one safe simulation for an existing alert and active user.</summary>
    public async Task<SimulatedResponseActionResponse> CreateAsync(
        Guid alertId,
        Guid requestedByUserId,
        CreateSimulatedResponseActionRequest request,
        CancellationToken ct)
    {
        var alert = await db.Alerts
            .AsNoTracking()
            .Where(x => x.Id == alertId)
            .Select(x => new
            {
                x.EndpointId,
                EndpointHostname = x.Endpoint.Hostname
            })
            .SingleOrDefaultAsync(ct);

        if (alert is null)
        {
            throw SocRequestException.Missing();
        }

        if (!await db.Users.AsNoTracking()
                .AnyAsync(x => x.Id == requestedByUserId && x.IsActive, ct))
        {
            throw SocRequestException.Invalid(
                "Authenticated user is not an active persisted account.",
                "requestedByUserId");
        }

        string target;
        try
        {
            target = SimulatedSoarPolicy.NormalizeTarget(
                request.ActionType,
                request.Target,
                alert.EndpointHostname);
        }
        catch (ArgumentException exception)
        {
            throw SocRequestException.Invalid(exception.Message, "target");
        }

        var timestamp = clock.GetUtcNow();
        var item = new SimulatedResponseAction
        {
            Id = Guid.NewGuid(),
            AlertId = alertId,
            EndpointId = alert.EndpointId,
            RequestedByUserId = requestedByUserId,
            ActionType = request.ActionType,
            Target = target,
            Reason = request.Reason.Trim(),
            Status = SimulatedActionStatus.SimulatedCompleted,
            ResultSummary = executor.Simulate(request.ActionType, target),
            IsSimulation = true,
            RequestedAtUtc = timestamp,
            CompletedAtUtc = timestamp
        };

        db.SimulatedResponseActions.Add(item);
        await db.SaveChangesAsync(ct);

        return Map(item);
    }

    private static SimulatedResponseActionResponse Map(
        SimulatedResponseAction item) =>
        new(
            item.Id,
            item.AlertId,
            item.EndpointId,
            item.RequestedByUserId,
            item.ActionType,
            item.Target,
            item.Reason,
            item.Status,
            item.ResultSummary,
            item.IsSimulation,
            item.RequestedAtUtc,
            item.CompletedAtUtc);
}
