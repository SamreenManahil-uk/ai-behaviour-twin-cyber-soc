using CyberSoc.Api.Contracts.Common;
using CyberSoc.Api.Contracts.Soc;
using CyberSoc.Api.Data;
using CyberSoc.Api.Detection;
using CyberSoc.Api.Domain.Entities;
using CyberSoc.Api.Realtime;
using Microsoft.EntityFrameworkCore;

namespace CyberSoc.Api.Application;

/// <summary>
/// Explicit event ingestion with deterministic rule detection.
/// No real endpoint response action is performed.
/// </summary>
public sealed class EventService(
    CyberSocDbContext db,
    TimeProvider clock,
    RuleDetectionEngine? detectionEngine = null,
    IAlertRealtimePublisher? realtimePublisher = null,
    ILogger<EventService>? logger = null)
{
    /// <summary>
    /// Lists matching events newest first with an identifier tie-breaker.
    /// </summary>
    public Task<PageResponse<EventResponse>> ListAsync(
        EventQuery filter,
        CancellationToken ct)
    {
        var query = db.SecurityEvents.AsNoTracking();

        if (filter.EndpointId is { } endpoint)
        {
            query = query.Where(x => x.EndpointId == endpoint);
        }

        if (filter.Severity is { } severity)
        {
            query = query.Where(x => x.Severity == severity);
        }

        if (filter.EventType is { } type)
        {
            query = query.Where(x => x.EventType == type);
        }

        if (filter.Source is { } source)
        {
            query = query.Where(x => x.Source == source);
        }

        if (filter.StartUtc is { } start)
        {
            query = query.Where(x => x.EventTimestampUtc >= start);
        }

        if (filter.EndUtc is { } end)
        {
            query = query.Where(x => x.EventTimestampUtc <= end);
        }

        return query
            .OrderByDescending(x => x.EventTimestampUtc)
            .ThenBy(x => x.Id)
            .Select(SocMapping.Event)
            .PageAsync(filter, ct);
    }

    /// <summary>
    /// Returns one event's explicit fields, including untrusted JSON text.
    /// </summary>
    public async Task<EventResponse> GetAsync(
        Guid id,
        CancellationToken ct) =>
        await db.SecurityEvents
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(SocMapping.Event)
            .SingleOrDefaultAsync(ct) ??
        throw SocRequestException.Missing();

    /// <summary>
    /// Stores an event and creates one rule alert when detection matches.
    /// </summary>
    public async Task<EventResponse> CreateAsync(
        CreateEventRequest request,
        CancellationToken ct)
    {
        if (!await db.Endpoints.AnyAsync(
                x => x.Id == request.EndpointId,
                ct))
        {
            throw SocRequestException.Invalid(
                "Endpoint does not exist.",
                "endpointId");
        }

        var now = clock.GetUtcNow();

        var item = new SecurityEvent
        {
            Id = Guid.NewGuid(),
            EndpointId = request.EndpointId,
            EventType = request.EventType.Trim(),
            Source = request.Source.Trim(),
            EventTimestampUtc = request.EventTimestampUtc,
            Severity = request.Severity,
            ProcessName = request.ProcessName,
            UserName = request.UserName,
            SourceIp = request.SourceIp,
            DestinationIp = request.DestinationIp,
            RawPayload = request.RawPayload,
            IngestedAtUtc = now,
        };

        RuleDetectionResult detection;

        try
        {
            detection = detectionEngine?.Evaluate(item) ??
                RuleDetectionResult.NoMatch();
        }
        catch (ArgumentException)
        {
            throw SocRequestException.Invalid(
                "RawPayload must be a strict JSON object.",
                "rawPayload");
        }

        Alert? alert = null;

        if (detection.IsMatch)
        {
            alert = RuleAlertFactory.Create(
                item,
                detection,
                now);
        }

        await using var transaction =
            await db.Database.BeginTransactionAsync(ct);

        db.SecurityEvents.Add(item);

        if (alert is not null)
        {
            db.Alerts.Add(alert);
        }

        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        if (alert is not null)
        {
            await PublishCreatedBestEffortAsync(alert);
        }

        return SocMapping.Map(item);
    }

    private async Task PublishCreatedBestEffortAsync(Alert alert)
    {
        if (realtimePublisher is null)
        {
            return;
        }

        try
        {
            await realtimePublisher.PublishCreatedAsync(
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
