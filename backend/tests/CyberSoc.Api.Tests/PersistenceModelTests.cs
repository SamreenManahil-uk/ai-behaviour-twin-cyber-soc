using CyberSoc.Api.Data;
using CyberSoc.Api.Domain.Entities;
using CyberSoc.Api.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Endpoint = CyberSoc.Api.Domain.Entities.Endpoint;

namespace CyberSoc.Api.Tests;

public sealed class PersistenceModelTests
{
    private static CyberSocDbContext CreateContext() => new CyberSocDbContextFactory().CreateDbContext([]);

    [Fact]
    public void Model_ContainsExactlySixEntitiesWithSnakeCaseNamesAndGuidKeys()
    {
        using var context = CreateContext();
        var entities = context.Model.GetEntityTypes().ToArray();
        Assert.Equal(7, entities.Length);
        foreach (var type in new[] { typeof(User), typeof(Endpoint), typeof(SecurityEvent), typeof(Alert), typeof(Incident), typeof(Threat) })
        {
            var entity = context.Model.FindEntityType(type);
            Assert.NotNull(entity);
            Assert.Matches("^[a-z][a-z_]*$", entity.GetTableName()!);
            var key = Assert.Single(entity.FindPrimaryKey()!.Properties);
            Assert.Equal("Id", key.Name);
            Assert.Equal(typeof(Guid), key.ClrType);
            Assert.All(entity.GetProperties(), property => Assert.Matches("^[a-z][a-z_]*$", property.GetColumnName()));
        }
    }

    [Theory]
    [InlineData(typeof(User), "Email")]
    [InlineData(typeof(Endpoint), "Hostname")]
    [InlineData(typeof(Alert), "SecurityEventId")]
    public void RequiredUniqueIndexesExist(Type type, string property)
    {
        using var context = CreateContext();
        var entity = context.Model.FindEntityType(type)!;
        Assert.Contains(entity.GetIndexes(), index => index.IsUnique && index.Properties.Select(p => p.Name).SequenceEqual([property]));
        Assert.False(entity.FindProperty(property)!.IsNullable);
    }

    [Theory]
    [InlineData(typeof(SecurityEvent), typeof(Endpoint), "EndpointId", true)]
    [InlineData(typeof(Alert), typeof(Endpoint), "EndpointId", true)]
    [InlineData(typeof(Alert), typeof(Incident), "IncidentId", false)]
    [InlineData(typeof(Incident), typeof(User), "AssignedUserId", false)]
    public void RelationshipsHaveExpectedForeignKeysAndRequiredness(Type dependent, Type principal, string property, bool required)
    {
        using var context = CreateContext();
        var fk = Assert.Single(context.Model.FindEntityType(dependent)!.GetForeignKeys(),
            fk => fk.PrincipalEntityType.ClrType == principal);
        Assert.Equal(property, Assert.Single(fk.Properties).Name);
        Assert.Equal(required, fk.IsRequired);
    }

    [Fact]
    public void AlertEventRelationship_IsOneToOneAndEnforcesSameEndpoint()
    {
        using var context = CreateContext();
        var fk = Assert.Single(context.Model.FindEntityType(typeof(Alert))!.GetForeignKeys(),
            fk => fk.PrincipalEntityType.ClrType == typeof(SecurityEvent));
        Assert.True(fk.IsRequired);
        Assert.True(fk.IsUnique);
        Assert.Equal(new[] { "SecurityEventId", "EndpointId" }, fk.Properties.Select(p => p.Name));
        Assert.Equal(new[] { "Id", "EndpointId" }, fk.PrincipalKey.Properties.Select(p => p.Name));
        Assert.False(fk.IsRequiredDependent);
    }

    [Fact]
    public void AllForeignKeys_RestrictDeletion()
    {
        using var context = CreateContext();
        var keys = context.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()).ToArray();
        Assert.Equal(8, keys.Length);
        Assert.All(keys, key => Assert.Equal(DeleteBehavior.Restrict, key.DeleteBehavior));
    }

    [Fact]
    public void RawPayload_IsRequiredJsonb()
    {
        using var context = CreateContext();
        var property = context.Model.FindEntityType(typeof(SecurityEvent))!.FindProperty("RawPayload")!;
        Assert.Equal("jsonb", property.GetColumnType());
        Assert.False(property.IsNullable);
    }

    [Theory]
    [InlineData(typeof(Alert), "RiskScore", "ck_alerts_risk_score", "risk_score")]
    [InlineData(typeof(Threat), "ConfidenceScore", "ck_threats_confidence_score", "confidence_score")]
    public void Scores_HavePrecisionAndDatabaseBounds(Type type, string name, string constraintName, string column)
    {
        using var context = CreateContext();
        var entity = context.GetService<IDesignTimeModel>().Model.FindEntityType(type)!;
        var property = entity.FindProperty(name)!;
        Assert.Equal(5, property.GetPrecision());
        Assert.Equal(2, property.GetScale());
        var constraint = Assert.Single(entity.GetCheckConstraints(), c => c.Name == constraintName);
        Assert.Equal($"{column} >= 0 AND {column} <= 100", constraint.Sql);
    }

    [Fact]
    public void AllEnums_PersistAsReadableStrings()
    {
        using var context = CreateContext();
        var properties = context.Model.GetEntityTypes().SelectMany(e => e.GetProperties()).Where(p => p.ClrType.IsEnum).ToArray();
        Assert.Equal(12, properties.Length);
        foreach (var property in properties)
        {
            var converter = property.GetTypeMapping().Converter;
            Assert.NotNull(converter);
            Assert.Equal(typeof(string), converter.ProviderClrType);
            foreach (var value in Enum.GetValues(property.ClrType))
            {
                Assert.Equal(value.ToString(), converter.ConvertToProvider(value));
                Assert.Equal(value, converter.ConvertFromProvider(value.ToString()));
            }
        }
    }

    [Fact]
    public void Timestamps_MapToTimestampWithTimeZone()
    {
        using var context = CreateContext();
        var timestamps = context.Model.GetEntityTypes().SelectMany(e => e.GetProperties())
            .Where(p => p.ClrType == typeof(DateTimeOffset) || p.ClrType == typeof(DateTimeOffset?)).ToArray();
        Assert.Equal(16, timestamps.Length);
        Assert.All(timestamps, p => Assert.Equal("timestamp with time zone", p.GetColumnType()));
    }

    [Fact]
    public void RequiredStrings_HaveLengthLimitsExceptJsonPayload()
    {
        using var context = CreateContext();
        foreach (var type in new[] { typeof(User), typeof(Endpoint), typeof(SecurityEvent), typeof(Alert), typeof(Incident), typeof(Threat) })
        {
            var entity = context.Model.FindEntityType(type)!;
            foreach (var property in type.GetProperties().Where(p => p.IsDefined(typeof(System.Runtime.CompilerServices.RequiredMemberAttribute), false)))
            {
                var mapped = entity.FindProperty(property.Name)!;
                Assert.False(mapped.IsNullable);
                if (property.Name != "RawPayload")
                {
                    Assert.True(mapped.GetMaxLength() > 0);
                }
            }
        }
    }
}
