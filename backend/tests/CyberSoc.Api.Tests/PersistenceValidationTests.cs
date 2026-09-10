using CyberSoc.Api.Data;
using CyberSoc.Api.Domain.Entities;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CyberSoc.Api.Tests;

public sealed class PersistenceValidationTests
{
    [Theory]
    [InlineData(-0.01)]
    [InlineData(100.01)]
    public void Scores_RejectOutOfRangeValues(decimal score)
    {
        var alert = new Alert { Title = "Test", Description = "Test" };
        var threat = new Threat { IndicatorValue = "Test", ThreatName = "Test", Source = "Test" };
        Assert.Throws<ArgumentOutOfRangeException>(() => alert.RiskScore = score);
        Assert.Throws<ArgumentOutOfRangeException>(() => threat.ConfidenceScore = score);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(50.25)]
    [InlineData(100)]
    public void Scores_AcceptValidValues(decimal score)
    {
        Assert.Equal(score, new Alert { Title = "Test", Description = "Test", RiskScore = score }.RiskScore);
        Assert.Equal(score, new Threat { IndicatorValue = "Test", ThreatName = "Test", Source = "Test", ConfidenceScore = score }.ConfidenceScore);
    }

    [Fact]
    public void Email_NormalizesOnCreationAndReassignment()
    {
        var user = new User { Email = "  Analyst@Example.invalid  ", DisplayName = "Test", PasswordHash = "hash-format-not-implemented" };
        Assert.Equal("ANALYST@EXAMPLE.INVALID", user.Email);
        user.Email = " changed@example.invalid ";
        Assert.Equal("CHANGED@EXAMPLE.INVALID", user.Email);
        Assert.Throws<ArgumentException>(() => user.Email = "  ");
    }

    [Fact]
    public async Task NonUtcTimestamps_AreRejectedBeforeDatabaseAccess()
    {
        using var context = new CyberSocDbContextFactory().CreateDbContext([]);
        context.Threats.Add(new Threat
        {
            IndicatorValue = "Test",
            ThreatName = "Test",
            Source = "Test",
            CreatedAtUtc = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.FromHours(1))
        });
        Assert.Contains("CreatedAtUtc must have a zero UTC offset", Assert.Throws<InvalidOperationException>(() => context.SaveChanges()).Message);
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => context.SaveChangesAsync());
        Assert.Contains("CreatedAtUtc must have a zero UTC offset", exception.Message);
    }

    [Fact]
    public void MissingConnectionString_FailsOnlyWhenContextIsResolved()
    {
        using var factory = new AuthTestFactory().WithWebHostBuilder(builder =>
            builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(
                new Dictionary<string, string?> { ["ConnectionStrings:PostgreSql"] = "" })));
        using var scope = factory.Services.CreateScope();
        var exception = Assert.Throws<InvalidOperationException>(() => scope.ServiceProvider.GetRequiredService<CyberSocDbContext>());
        Assert.Contains("ConnectionStrings__PostgreSql", exception.Message);
    }
}
