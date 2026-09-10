using System.Data;
using CyberSoc.Api.Contracts.Common;
using CyberSoc.Api.Contracts.Soc;
using CyberSoc.Api.Data;
using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Validation;
using Microsoft.EntityFrameworkCore;
using Endpoint = CyberSoc.Api.Domain.Entities.Endpoint;

namespace CyberSoc.Api.Application;

/// <summary>Registered endpoint metadata only; performs no device collection or actions.</summary>
public sealed class EndpointService(CyberSocDbContext db, TimeProvider clock)
{
    /// <summary>Returns filtered, deterministically ordered endpoint metadata.</summary>
    public Task<PageResponse<EndpointResponse>> ListAsync(EndpointQuery filter, CancellationToken ct)
    {
        var query = db.Endpoints.AsNoTracking();
        if (filter.Status is { } status) query = query.Where(x => x.Status == status);
        if (filter.OperatingSystem is { } os) query = query.Where(x => x.OperatingSystem == os);
        if (filter.Search is { } search) { var term = search.Trim().ToLowerInvariant(); query = query.Where(x => x.Hostname.ToLower().Contains(term)); }
        return query.OrderByDescending(x => x.LastSeenAtUtc).ThenBy(x => x.Id).Select(SocMapping.Endpoint).PageAsync(filter, ct);
    }

    /// <summary>Returns one safe endpoint resource.</summary>
    public async Task<EndpointResponse> GetAsync(Guid id, CancellationToken ct) =>
        await db.Endpoints.AsNoTracking().Where(x => x.Id == id).Select(SocMapping.Endpoint).SingleOrDefaultAsync(ct) ?? throw SocRequestException.Missing();

    /// <summary>Registers metadata with normalized unique hostname comparison.</summary>
    public async Task<EndpointResponse> CreateAsync(CreateEndpointRequest request, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var hostname = SocInput.Hostname(request.Hostname);
        if (await db.Endpoints.AnyAsync(x => x.Hostname.ToLower() == hostname, ct)) throw SocRequestException.Conflict("Hostname is already registered.");
        var now = clock.GetUtcNow();
        var endpoint = new Endpoint
        {
            Id = Guid.NewGuid(),
            Hostname = hostname,
            OperatingSystem = request.OperatingSystem,
            IpAddress = request.IpAddress,
            AgentVersion = request.AgentVersion?.Trim(),
            Status = EndpointStatus.Offline,
            CreatedAtUtc = now,
            LastSeenAtUtc = now
        };
        db.Endpoints.Add(endpoint);
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return SocMapping.Map(endpoint);
    }

    /// <summary>Updates only explicitly supplied mutable metadata.</summary>
    public async Task<EndpointResponse> PatchAsync(Guid id, PatchEndpointRequest request, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var endpoint = await db.Endpoints.SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw SocRequestException.Missing();
        if (request.Status is { } status) endpoint.Status = status;
        if (request.AgentVersionSpecified) endpoint.AgentVersion = request.AgentVersion?.Trim();
        if (request.IpAddressSpecified) endpoint.IpAddress = request.IpAddress;
        if (request.LastSeenAtUtc is { } seen) endpoint.LastSeenAtUtc = seen;
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return SocMapping.Map(endpoint);
    }
}
