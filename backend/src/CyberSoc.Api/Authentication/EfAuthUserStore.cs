using CyberSoc.Api.Data;
using CyberSoc.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CyberSoc.Api.Authentication;

internal sealed class EfAuthUserStore(CyberSocDbContext db) : IAuthUserStore
{
    public Task<User?> FindActiveAsync(string normalizedEmail, CancellationToken cancellationToken) =>
        db.Users.AsNoTracking().SingleOrDefaultAsync(user => user.IsActive && user.Email == normalizedEmail, cancellationToken);

    public async Task<bool> TryUpgradeHashAsync(User user, string newHash, DateTimeOffset updatedAtUtc, CancellationToken cancellationToken) =>
        await db.Users.Where(current => current.Id == user.Id && current.IsActive && current.PasswordHash == user.PasswordHash)
            .ExecuteUpdateAsync(setters => setters.SetProperty(current => current.PasswordHash, newHash)
                .SetProperty(current => current.UpdatedAtUtc, updatedAtUtc), cancellationToken) == 1;
}
