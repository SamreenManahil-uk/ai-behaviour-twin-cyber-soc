using CyberSoc.Api.Contracts.Common;
using CyberSoc.Api.Contracts.Soc;
using Microsoft.EntityFrameworkCore;

namespace CyberSoc.Api.Application;

internal static class PageQueryExtensions
{
    public static async Task<PageResponse<T>> PageAsync<T>(this IQueryable<T> query, PageQuery page, CancellationToken cancellationToken)
    {
        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page.Page - 1) * page.PageSize).Take(page.PageSize).ToListAsync(cancellationToken);
        return new(items, page.Page, page.PageSize, total, (int)Math.Ceiling((double)total / page.PageSize));
    }
}
