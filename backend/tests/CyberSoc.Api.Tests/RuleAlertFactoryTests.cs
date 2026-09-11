using CyberSoc.Api.Application;
using CyberSoc.Api.Detection;
using CyberSoc.Api.Domain.Entities;
using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Tests;

public sealed class RuleAlertFactoryTests
{
    [Fact]
    public void CreatesExplainableRuleAlert()
    {
        var securityEvent = Event();
        var now = DateTimeOffset.Parse(
            "2026-09-11T20:30:00+00:00");

        var detection = new RuleDetectionResult
        {
            IsMatch = true,
            Title = "Encoded command execution",
            Description =
                "Deterministic rule match; not an attack probability.",
            Severity = Severity.Medium,
            RiskScore = 40m,
            PrimaryMitreTechniqueId = "T1059.001",
            PrimaryMitreTechniqueName = "PowerShell",
            MatchedRuleIds = ["RULE-ENCODED-POWERSHELL"],
            Evidence =
            [
                "Encoded command activity was declared in endpoint telemetry.",
            ],
        };

        var alert = RuleAlertFactory.Create(
            securityEvent,
            detection,
            now);

        Assert.NotEqual(Guid.Empty, alert.Id);
        Assert.Equal(securityEvent.Id, alert.SecurityEventId);
        Assert.Equal(securityEvent.EndpointId, alert.EndpointId);
        Assert.Equal(AlertStatus.New, alert.Status);
        Assert.Equal(DetectionSource.Rule, alert.DetectionSource);
        Assert.Equal(40m, alert.RiskScore);
        Assert.Equal("T1059.001", alert.MitreTechniqueId);
        Assert.Contains(
            "not an attack probability",
            alert.Description,
            StringComparison.Ordinal);
        Assert.Contains(
            "Encoded command activity",
            alert.Description,
            StringComparison.Ordinal);
        Assert.Equal(now, alert.CreatedAtUtc);
        Assert.Equal(now, alert.UpdatedAtUtc);
    }

    [Fact]
    public void RejectsNonMatchingDetection()
    {
        Assert.Throws<InvalidOperationException>(
            () => RuleAlertFactory.Create(
                Event(),
                RuleDetectionResult.NoMatch(),
                DateTimeOffset.Parse(
                    "2026-09-11T20:30:00+00:00")));
    }

    [Fact]
    public void RejectsNonUtcTimestamp()
    {
        var detection = new RuleDetectionResult
        {
            IsMatch = true,
            Title = "Test detection",
            Description = "Test",
            Severity = Severity.Low,
            RiskScore = 10m,
            MatchedRuleIds = ["TEST"],
            Evidence = ["Test evidence"],
        };

        Assert.Throws<ArgumentException>(
            () => RuleAlertFactory.Create(
                Event(),
                detection,
                DateTimeOffset.Parse(
                    "2026-09-11T20:30:00+01:00")));
    }

    private static SecurityEvent Event() =>
        new()
        {
            Id = Guid.NewGuid(),
            EndpointId = Guid.NewGuid(),
            EventType = "endpoint.behaviour",
            Source = "simulated-windows-agent",
            EventTimestampUtc = DateTimeOffset.Parse(
                "2026-09-11T20:29:00+00:00"),
            Severity = Severity.Informational,
            RawPayload =
                """{"encoded_command":true}""",
            IngestedAtUtc = DateTimeOffset.Parse(
                "2026-09-11T20:30:00+00:00"),
        };
}
