using CyberSoc.Api.Contracts.Common;
using CyberSoc.Api.Contracts.Soc;
using CyberSoc.Api.Data;
using CyberSoc.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CyberSoc.Api.Application;

/// <summary>Explicit event ingestion and read queries, independent of future detection.</summary>
public sealed class EventService(CyberSocDbContext db, TimeProvider clock)
{
    /// <summary>Lists matching events newest first with an identifier tie-breaker.</summary>
    public Task<PageResponse<EventResponse>> ListAsync(EventQuery filter, CancellationToken ct)
    {
        var query = db.SecurityEvents.AsNoTracking();
        if (filter.EndpointId is { } endpoint) query = query.Where(x => x.EndpointId == endpoint);
        if (filter.Severity is { } severity) query = query.Where(x => x.Severity == severity);
        if (filter.EventType is { } type) query = query.Where(x => x.EventType == type);
        if (filter.Source is { } source) query = query.Where(x => x.Source == source);
        if (filter.StartUtc is { } start) query = query.Where(x => x.EventTimestampUtc >= start);
        if (filter.EndUtc is { } end) query = query.Where(x => x.EventTimestampUtc <= end);
        return query.OrderByDescending(x => x.EventTimestampUtc).ThenBy(x => x.Id).Select(SocMapping.Event).PageAsync(filter, ct);
    }

    /// <summary>Returns one event's safe explicit fields, including untrusted JSON text.</summary>
    public async Task<EventResponse> GetAsync(Guid id, CancellationToken ct) =>
        await db.SecurityEvents.AsNoTracking().Where(x => x.Id == id).Select(SocMapping.Event).SingleOrDefaultAsync(ct) ?? throw SocRequestException.Missing();

    /// <summary>Stores an event with server identity and ingestion time; never creates an alert.</summary>
    public async Task<EventResponse> CreateAsync(CreateEventRequest request, CancellationToken ct)
    {
        if (!await db.Endpoints.AnyAsync(x => x.Id == request.EndpointId, ct)) throw SocRequestException.Invalid("Endpoint does not exist.", "endpointId");
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
            IngestedAtUtc = clock.GetUtcNow()
        };
        db.SecurityEvents.Add(item);
        await db.SaveChangesAsync(ct);
        return SocMapping.Map(item);
    }
}
