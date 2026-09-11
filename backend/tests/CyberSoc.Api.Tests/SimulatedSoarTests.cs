using System.ComponentModel.DataAnnotations;
using CyberSoc.Api.Application;
using CyberSoc.Api.Contracts.Soar;
using CyberSoc.Api.Domain.Entities;
using CyberSoc.Api.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Xunit;

namespace CyberSoc.Api.Tests;

public sealed class SimulatedSoarTests
{
    [Theory]
    [InlineData(SimulatedActionType.IsolateEndpoint)]
    [InlineData(SimulatedActionType.BlockIpAddress)]
    [InlineData(SimulatedActionType.TerminateProcess)]
    [InlineData(SimulatedActionType.DisableAccount)]
    [InlineData(SimulatedActionType.CollectForensics)]
    public void ExecutorAlwaysReportsSimulationOnly(
        SimulatedActionType actionType)
    {
        var executor = new SimulatedSoarExecutor();

        var result = executor.Simulate(actionType, "fictional-target");

        Assert.StartsWith("SIMULATION ONLY:", result);
        Assert.Contains("No ", result);
    }

    [Fact]
    public void EndpointActionUsesAlertEndpointAndRejectsOverride()
    {
        Assert.Equal(
            "fictional-endpoint-01",
            SimulatedSoarPolicy.NormalizeTarget(
                SimulatedActionType.IsolateEndpoint,
                null,
                "fictional-endpoint-01"));

        Assert.Throws<ArgumentException>(() =>
            SimulatedSoarPolicy.NormalizeTarget(
                SimulatedActionType.IsolateEndpoint,
                "another-device",
                "fictional-endpoint-01"));
    }

    [Theory]
    [InlineData("203.0.113.10")]
    [InlineData("2001:db8::10")]
    public void BlockIpAcceptsValidDocumentationAddresses(string address)
    {
        Assert.Equal(
            address,
            SimulatedSoarPolicy.NormalizeTarget(
                SimulatedActionType.BlockIpAddress,
                address,
                "fictional-endpoint-01"));
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-an-ip")]
    [InlineData("999.999.999.999")]
    public void BlockIpRejectsInvalidTargets(string target)
    {
        Assert.Throws<ArgumentException>(() =>
            SimulatedSoarPolicy.NormalizeTarget(
                SimulatedActionType.BlockIpAddress,
                target,
                "fictional-endpoint-01"));
    }

    [Fact]
    public void RequestValidationRequiresMeaningfulReason()
    {
        var request = new CreateSimulatedResponseActionRequest
        {
            ActionType = SimulatedActionType.CollectForensics,
            Reason = "short"
        };

        var results = new List<ValidationResult>();
        var valid = Validator.TryValidateObject(
            request,
            new ValidationContext(request),
            results,
            validateAllProperties: true);

        Assert.False(valid);
        Assert.Contains(
            results,
            result => result.MemberNames.Contains(nameof(request.Reason)));
    }

    [Fact]
    public void PersistenceMetadataEnforcesSimulationAuditBoundary()
    {
        var options = new DbContextOptionsBuilder<
            CyberSoc.Api.Data.CyberSocDbContext>()
            .UseNpgsql("Host=localhost;Database=metadata_only")
            .Options;

        using var db = new CyberSoc.Api.Data.CyberSocDbContext(options);
        var designTimeModel =
            db.GetService<IDesignTimeModel>().Model;
        var entity = designTimeModel.FindEntityType(
            typeof(SimulatedResponseAction));

        Assert.NotNull(entity);
        Assert.Equal(
            "simulated_response_actions",
            entity!.GetTableName());

        var foreignKeys = entity.GetForeignKeys().ToArray();
        Assert.Equal(3, foreignKeys.Length);
        Assert.All(
            foreignKeys,
            foreignKey =>
                Assert.Equal(DeleteBehavior.Restrict, foreignKey.DeleteBehavior));

        var checkConstraint = entity.GetCheckConstraints().Single(
            constraint =>
                constraint.Name ==
                "ck_simulated_response_actions_simulation_only");

        Assert.Contains(
            "is_simulation = TRUE",
            checkConstraint.Sql);
    }
}
