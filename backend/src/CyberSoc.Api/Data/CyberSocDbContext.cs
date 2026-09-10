using Endpoint = CyberSoc.Api.Domain.Entities.Endpoint;
using System.Text.RegularExpressions;
using CyberSoc.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CyberSoc.Api.Data;

/// <summary>PostgreSQL persistence model. Callers supply UTC timestamps; no data is seeded.</summary>
public sealed class CyberSocDbContext(DbContextOptions<CyberSocDbContext> options) : DbContext(options)
{
    /// <summary>Users with encoded password hashes.</summary>
    public DbSet<User> Users => Set<User>();
    /// <summary>Monitored endpoints.</summary>
    public DbSet<Endpoint> Endpoints => Set<Endpoint>();
    /// <summary>Endpoint event history.</summary>
    public DbSet<SecurityEvent> SecurityEvents => Set<SecurityEvent>();
    /// <summary>Detected alerts.</summary>
    public DbSet<Alert> Alerts => Set<Alert>();
    /// <summary>Investigation incidents.</summary>
    public DbSet<Incident> Incidents => Set<Incident>();
    /// <summary>Threat indicators.</summary>
    public DbSet<Threat> Threats => Set<Threat>();

    /// <inheritdoc />
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CyberSocDbContext).Assembly);

        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(SnakeCase(property.Name));
            }

            foreach (var key in entity.GetKeys())
            {
                key.SetName(SnakeCase(key.GetName()!));
            }

            foreach (var foreignKey in entity.GetForeignKeys())
            {
                foreignKey.SetConstraintName(SnakeCase(foreignKey.GetConstraintName()!));
            }

            foreach (var index in entity.GetIndexes())
            {
                index.SetDatabaseName(SnakeCase(index.GetDatabaseName()!));
            }
        }
    }

    /// <inheritdoc />
    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ValidateUtcTimestamps();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    /// <inheritdoc />
    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        ValidateUtcTimestamps();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void ValidateUtcTimestamps()
    {
        foreach (var entry in ChangeTracker.Entries()
            .Where(entry => entry.State is EntityState.Added or EntityState.Modified))
        {
            foreach (var property in entry.Properties)
            {
                if (property.CurrentValue is DateTimeOffset timestamp && timestamp.Offset != TimeSpan.Zero)
                {
                    throw new InvalidOperationException($"{entry.Metadata.ClrType.Name}.{property.Metadata.Name} must have a zero UTC offset.");
                }
            }
        }
    }

    private static string SnakeCase(string value) =>
        Regex.Replace(value, "([a-z0-9])([A-Z])", "$1_$2").ToLowerInvariant();
}
