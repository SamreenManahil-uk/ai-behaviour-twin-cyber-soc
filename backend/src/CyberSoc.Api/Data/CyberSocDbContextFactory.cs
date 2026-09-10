using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace CyberSoc.Api.Data;

/// <summary>Creates the PostgreSQL model offline, or uses an explicitly supplied environment connection for migration application.</summary>
public sealed class CyberSocDbContextFactory : IDesignTimeDbContextFactory<CyberSocDbContext>
{
    /// <inheritdoc />
    public CyberSocDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__PostgreSql");
        var options = new DbContextOptionsBuilder<CyberSocDbContext>()
            .UseNpgsql(string.IsNullOrWhiteSpace(connectionString) ? null : connectionString).Options;
        return new CyberSocDbContext(options);
    }
}
