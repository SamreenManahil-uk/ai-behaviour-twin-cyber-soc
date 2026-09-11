using System.Data;
using CyberSoc.Api.Contracts.Common;
using CyberSoc.Api.Contracts.Soc;
using CyberSoc.Api.Data;
using CyberSoc.Api.Realtime;
using Microsoft.EntityFrameworkCore;

namespace CyberSoc.Api.Application;

/// <summary>Alert triage without detection or endpoint response actions.</summary>
public sealed class AlertService(
    CyberSocDbContext db,
    TimeProvider clock,
    IAlertRealtimePublisher? realtimePublisher = null,
    ILogger<AlertService>? logger = null)
{
    /// <summary>Lists bounded alert summaries without raw event payloads.</summary>
    public Task<PageResponse<AlertResponse>> ListAsync(AlertQuery filter, CancellationToken ct)
    {
        var query = db.Alerts.AsNoTracking();
        if (filter.Severity is { } severity) query = query.Where(x => x.Severity == severity);
        if (filter.Status is { } status) query = query.Where(x => x.Status == status);
        if (filter.EndpointId is { } endpoint) query = query.Where(x => x.EndpointId == endpoint);
        if (filter.DetectionSource is { } source) query = query.Where(x => x.DetectionSource == source);
        if (filter.StartUtc is { } start) query = query.Where(x => x.CreatedAtUtc >= start);
        if (filter.EndUtc is { } end) query = query.Where(x => x.CreatedAtUtc <= end);
        return query.OrderByDescending(x => x.CreatedAtUtc).ThenBy(x => x.Id).Select(SocMapping.Alert).PageAsync(filter, ct);
    }

    /// <summary>Returns an alert and small related resource summaries.</summary>
    public async Task<AlertDetailResponse> GetAsync(Guid id, CancellationToken ct)
    {
        var item = await db.Alerts.AsNoTracking().Include(x => x.Endpoint).Include(x => x.SecurityEvent).Include(x => x.Incident)
            .SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw SocRequestException.Missing();
        return new(SocMapping.Map(item), new(item.EndpointId, item.Endpoint.Hostname), new(item.SecurityEventId, item.SecurityEvent.EventType),
            item.Incident is null ? null : new(item.Incident.Id, item.Incident.Title));
    }

    /// <summary>Changes triage status only.</summary>
    public async Task<AlertResponse> PatchAsync(Guid id, PatchAlertRequest request, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var item = await db.Alerts.SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw SocRequestException.Missing();
        item.Status = request.Status;
        item.UpdatedAtUtc = clock.GetUtcNow();
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        await PublishUpdatedBestEffortAsync(item);
        return SocMapping.Map(item);
    }

    private async Task PublishUpdatedBestEffortAsync(
        CyberSoc.Api.Domain.Entities.Alert alert)
    {
        if (realtimePublisher is null)
        {
            return;
        }

        try
        {
            await realtimePublisher.PublishUpdatedAsync(
                AlertRealtimeMapper.Map(alert),
                CancellationToken.None);
        }
        catch (Exception exception)
        {
            logger?.LogWarning(
                exception,
                "Alert {AlertId} was persisted but its real-time notification could not be delivered.",
                alert.Id);
        }
    }
}
