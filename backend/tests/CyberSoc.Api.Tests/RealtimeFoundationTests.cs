using System.Reflection;
using CyberSoc.Api.Authorization;
using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Realtime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CyberSoc.Api.Tests;

public sealed class RealtimeFoundationTests
{
    [Fact]
    public void AlertHubRequiresSocOperationsPolicy()
    {
        var authorization = typeof(AlertHub)
            .GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(authorization);
        Assert.Equal(SocPolicies.SocOperations, authorization.Policy);
    }

    [Fact]
    public void AlertHubUsesStronglyTypedClientContract()
    {
        Assert.Equal(
            typeof(Hub<IAlertRealtimeClient>),
            typeof(AlertHub).BaseType);
    }

    [Fact]
    public void AlertHubExposesNoClientInvokableResponseActions()
    {
        var declaredPublicMethods = typeof(AlertHub).GetMethods(
            BindingFlags.Public |
            BindingFlags.Instance |
            BindingFlags.DeclaredOnly);

        Assert.Empty(declaredPublicMethods);
    }

    [Fact]
    public void RealtimeMessageContainsSafeBoundedAlertSummary()
    {
        var message = new AlertRealtimeMessage
        {
            AlertId = Guid.NewGuid(),
            EndpointId = Guid.NewGuid(),
            Title = "Suspicious encoded PowerShell",
            Severity = Severity.Critical,
            Status = AlertStatus.New,
            RiskScore = 94.5m,
            DetectionSource = DetectionSource.Hybrid,
            MitreTechniqueId = "T1059.001",
            OccurredAtUtc = DateTimeOffset.Parse(
                "2026-09-11T19:00:00+00:00"),
        };

        Assert.Equal(94.5m, message.RiskScore);
        Assert.Equal("T1059.001", message.MitreTechniqueId);
        Assert.Equal(TimeSpan.Zero, message.OccurredAtUtc.Offset);

        var propertyNames = typeof(AlertRealtimeMessage)
            .GetProperties()
            .Select(property => property.Name)
            .ToArray();

        Assert.DoesNotContain("RawPayload", propertyNames);
        Assert.DoesNotContain("Description", propertyNames);
    }
}
