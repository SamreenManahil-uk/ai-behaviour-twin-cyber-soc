using System.Data;
using CyberSoc.Api.Contracts.Common;
using CyberSoc.Api.Contracts.Soc;
using CyberSoc.Api.Data;
using CyberSoc.Api.Domain.Entities;
using CyberSoc.Api.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CyberSoc.Api.Application;

/// <summary>Transactional incident creation, alert attachment, and lifecycle edits.</summary>
public sealed class IncidentService(CyberSocDbContext db, TimeProvider clock)
{
    /// <summary>Lists incidents without account entities.</summary>
    public Task<PageResponse<IncidentResponse>> ListAsync(IncidentQuery filter, CancellationToken ct)
    {
        var query = db.Incidents.AsNoTracking();
        if (filter.Severity is { } severity) query = query.Where(x => x.Severity == severity);
        if (filter.Status is { } status) query = query.Where(x => x.Status == status);
        if (filter.AssignedUserId is { } user) query = query.Where(x => x.AssignedUserId == user);
        if (filter.StartUtc is { } start) query = query.Where(x => x.CreatedAtUtc >= start);
        if (filter.EndUtc is { } end) query = query.Where(x => x.CreatedAtUtc <= end);
        return query.OrderByDescending(x => x.CreatedAtUtc).ThenBy(x => x.Id).Select(SocMapping.Incident).PageAsync(filter, ct);
    }

    /// <summary>Returns one incident and its safe alert summaries.</summary>
    public async Task<IncidentDetailResponse> GetAsync(Guid id, CancellationToken ct)
    {
        var item = await db.Incidents.AsNoTracking().Where(x => x.Id == id).Select(SocMapping.Incident).SingleOrDefaultAsync(ct) ?? throw SocRequestException.Missing();
        var alerts = await db.Alerts.AsNoTracking().Where(x => x.IncidentId == id).OrderByDescending(x => x.CreatedAtUtc).ThenBy(x => x.Id).Select(SocMapping.Alert).ToListAsync(ct);
        return new(item, alerts);
    }

    /// <summary>Creates an Open incident and attaches only currently unassigned alerts atomically.</summary>
    public async Task<IncidentResponse> CreateAsync(CreateIncidentRequest request, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        await ValidateAssignee(request.AssignedUserId, ct);
        var ids = request.AlertIds ?? [];
        var alerts = await db.Alerts.Where(x => ids.Contains(x.Id)).ToListAsync(ct);
        if (alerts.Count != ids.Length) throw SocRequestException.Invalid("One or more alerts do not exist.", "alertIds");
        if (alerts.Any(x => x.IncidentId is not null)) throw SocRequestException.Conflict("One or more alerts already belong to an incident.");
        var now = clock.GetUtcNow();
        var item = new Incident
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Severity = request.Severity,
            Status = IncidentStatus.Open,
            AssignedUserId = request.AssignedUserId,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };
        db.Incidents.Add(item);
        foreach (var alert in alerts) { alert.IncidentId = item.Id; alert.UpdatedAtUtc = now; }
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return SocMapping.Map(item);
    }

    /// <summary>Edits supplied fields and keeps resolution time consistent with status.</summary>
    public async Task<IncidentResponse> PatchAsync(Guid id, PatchIncidentRequest request, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var item = await db.Incidents.SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw SocRequestException.Missing();
        if (request.AssignedUserIdSpecified) { await ValidateAssignee(request.AssignedUserId, ct); item.AssignedUserId = request.AssignedUserId; }
        if (request.Title is { } title) item.Title = title.Trim();
        if (request.Description is { } description) item.Description = description.Trim();
        if (request.Severity is { } severity) item.Severity = severity;
        var now = clock.GetUtcNow();
        if (request.Status is { } status)
        {
            item.Status = status;
            item.ResolvedAtUtc = status is IncidentStatus.Resolved or IncidentStatus.Closed ? item.ResolvedAtUtc ?? now : null;
        }
        item.UpdatedAtUtc = now;
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return SocMapping.Map(item);
    }

    private async Task ValidateAssignee(Guid? id, CancellationToken ct)
    {
        if (id is not null && !await db.Users.AnyAsync(x => x.Id == id && x.IsActive, ct))
            throw SocRequestException.Invalid("Assigned user must exist and be active.", "assignedUserId");
    }
}
