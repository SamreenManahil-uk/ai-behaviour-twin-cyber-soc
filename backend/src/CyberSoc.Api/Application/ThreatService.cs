using System.Data;
using CyberSoc.Api.Contracts.Common;
using CyberSoc.Api.Contracts.Soc;
using CyberSoc.Api.Data;
using CyberSoc.Api.Domain.Entities;
using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Validation;
using Microsoft.EntityFrameworkCore;

namespace CyberSoc.Api.Application;

/// <summary>Validated threat indicator management without external lookups.</summary>
public sealed class ThreatService(CyberSocDbContext db, TimeProvider clock)
{
    /// <summary>Lists filtered threat intelligence using stable ordering.</summary>
    public Task<PageResponse<ThreatResponse>> ListAsync(ThreatQuery filter, CancellationToken ct)
    {
        var query = db.Threats.AsNoTracking();
        if (filter.IndicatorType is { } type) query = query.Where(x => x.IndicatorType == type);
        if (filter.IsActive is { } active) query = query.Where(x => x.IsActive == active);
        if (filter.MinimumConfidence is { } score) query = query.Where(x => x.ConfidenceScore >= score);
        if (filter.Search is { } search) { var term = search.Trim().ToLowerInvariant(); query = query.Where(x => x.IndicatorValue.ToLower().Contains(term) || x.ThreatName.ToLower().Contains(term)); }
        return query.OrderByDescending(x => x.LastSeenAtUtc).ThenBy(x => x.Id).Select(SocMapping.Threat).PageAsync(filter, ct);
    }

    /// <summary>Returns one safe indicator.</summary>
    public async Task<ThreatResponse> GetAsync(Guid id, CancellationToken ct) =>
        await db.Threats.AsNoTracking().Where(x => x.Id == id).Select(SocMapping.Threat).SingleOrDefaultAsync(ct) ?? throw SocRequestException.Missing();

    /// <summary>Creates a normalized indicator, preventing duplicate active identities.</summary>
    public async Task<ThreatResponse> CreateAsync(CreateThreatRequest request, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var indicator = SocInput.Indicator(request.IndicatorType, request.IndicatorValue) ?? throw SocRequestException.Invalid("Invalid indicator.", "indicatorValue");
        if (request.IsActive) await CheckDuplicate(request.IndicatorType, indicator, null, ct);
        var item = new Threat
        {
            Id = Guid.NewGuid(),
            IndicatorType = request.IndicatorType,
            IndicatorValue = indicator,
            ThreatName = request.ThreatName.Trim(),
            Description = request.Description?.Trim(),
            ConfidenceScore = request.ConfidenceScore,
            Source = request.Source.Trim(),
            IsActive = request.IsActive,
            FirstSeenAtUtc = request.FirstSeenAtUtc,
            LastSeenAtUtc = request.LastSeenAtUtc,
            CreatedAtUtc = clock.GetUtcNow()
        };
        db.Threats.Add(item);
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return SocMapping.Map(item);
    }

    /// <summary>Updates metadata while preserving indicator identity and time ordering.</summary>
    public async Task<ThreatResponse> PatchAsync(Guid id, PatchThreatRequest request, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var item = await db.Threats.SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw SocRequestException.Missing();
        if (request.ThreatName is { } name) item.ThreatName = name.Trim();
        if (request.DescriptionSpecified) item.Description = request.Description?.Trim();
        if (request.ConfidenceScore is { } score) item.ConfidenceScore = score;
        if (request.Source is { } source) item.Source = source.Trim();
        if (request.LastSeenAtUtc is { } seen) item.LastSeenAtUtc = seen;
        if (item.LastSeenAtUtc < item.FirstSeenAtUtc) throw SocRequestException.Invalid("LastSeenAtUtc must not precede FirstSeenAtUtc.", "lastSeenAtUtc");
        if (request.IsActive is { } active) item.IsActive = active;
        if (item.IsActive) await CheckDuplicate(item.IndicatorType, item.IndicatorValue, id, ct);
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return SocMapping.Map(item);
    }

    private async Task CheckDuplicate(IndicatorType type, string value, Guid? excludedId, CancellationToken ct)
    {
        if (await db.Threats.AnyAsync(x => x.IndicatorType == type && x.IndicatorValue == value && x.IsActive && x.Id != excludedId, ct))
            throw SocRequestException.Conflict("An active indicator with this identity already exists.");
    }
}
