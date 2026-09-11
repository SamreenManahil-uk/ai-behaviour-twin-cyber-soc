using CyberSoc.Api.Detection;
using CyberSoc.Api.Domain.Entities;
using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Tests;

public sealed class RuleDetectionEngineTests
{
    private readonly RuleDetectionEngine engine = new();

    [Fact]
    public void BenignEventProducesNoDetection()
    {
        var result = engine.Evaluate(Event(
            """{"failed_login_count":0,"outbound_bytes":2048}""",
            "explorer.exe"));

        Assert.False(result.IsMatch);
        Assert.Equal(0m, result.RiskScore);
        Assert.Equal(Severity.Informational, result.Severity);
        Assert.Empty(result.Evidence);
    }

    [Fact]
    public void EncodedPowerShellMapsToMitreTechnique()
    {
        var result = engine.Evaluate(Event(
            """
            {
              "powershell_used": true,
              "encoded_command": true
            }
            """,
            "powershell.exe"));

        Assert.True(result.IsMatch);
        Assert.Equal(40m, result.RiskScore);
        Assert.Equal(Severity.Medium, result.Severity);
        Assert.Equal(
            "T1059.001",
            result.PrimaryMitreTechniqueId);
        Assert.Contains(
            "RULE-ENCODED-POWERSHELL",
            result.MatchedRuleIds);
    }

    [Fact]
    public void RepeatedFailedLoginsMapToBruteForce()
    {
        var result = engine.Evaluate(Event(
            """{"failedLoginCount":8}"""));

        Assert.True(result.IsMatch);
        Assert.Equal(25m, result.RiskScore);
        Assert.Equal("T1110", result.PrimaryMitreTechniqueId);
        Assert.Contains(
            result.Evidence,
            evidence => evidence.Contains(
                "8 failed login",
                StringComparison.Ordinal));
    }

    [Fact]
    public void MultipleSignalsProduceCriticalCappedScore()
    {
        var result = engine.Evaluate(Event(
            """
            {
              "encoded_command": true,
              "failed_login_count":12,
              "privilege_event":true,
              "outbound_bytes":104857600
            }
            """,
            "rundll32.exe"));

        Assert.True(result.IsMatch);
        Assert.Equal(100m, result.RiskScore);
        Assert.Equal(Severity.Critical, result.Severity);
        Assert.Equal(5, result.MatchedRuleIds.Count);
        Assert.Equal(5, result.Evidence.Count);
    }

    [Fact]
    public void ProxyExecutionProcessMapsToT1218()
    {
        var result = engine.Evaluate(Event(
            "{}",
            "regsvr32.exe"));

        Assert.Equal("T1218", result.PrimaryMitreTechniqueId);
        Assert.Equal(25m, result.RiskScore);
    }

    [Fact]
    public void LargeOutboundTransferMapsToT1041()
    {
        var result = engine.Evaluate(Event(
            """{"outbound_bytes":62914560}"""));

        Assert.Equal("T1041", result.PrimaryMitreTechniqueId);
        Assert.Contains(
            result.Evidence,
            evidence => evidence.Contains(
                "60 MB",
                StringComparison.Ordinal));
    }

    [Fact]
    public void WrongJsonTypesDoNotCauseFalsePositive()
    {
        var result = engine.Evaluate(Event(
            """
            {
              "encoded_command":"true",
              "failed_login_count":"100",
              "privilege_event":1,
              "outbound_bytes":"999999999"
            }
            """));

        Assert.False(result.IsMatch);
    }

    [Fact]
    public void PayloadTextIsNeverExecutedOrTreatedAsACommand()
    {
        var result = engine.Evaluate(Event(
            """{"message":"rm -rf /; shutdown now"}"""));

        Assert.False(result.IsMatch);
    }

    [Fact]
    public void MalformedJsonIsRejectedClearly()
    {
        var exception = Assert.Throws<ArgumentException>(
            () => engine.Evaluate(Event("{invalid")));

        Assert.Contains(
            "valid strict JSON",
            exception.Message,
            StringComparison.Ordinal);
    }

    [Fact]
    public void ScoringIsDeterministic()
    {
        var securityEvent = Event(
            """
            {
              "encoded_command":true,
              "failed_login_count":7
            }
            """,
            "powershell.exe");

        var first = engine.Evaluate(securityEvent);
        var second = engine.Evaluate(securityEvent);

        Assert.Equal(first.IsMatch, second.IsMatch);
        Assert.Equal(first.Title, second.Title);
        Assert.Equal(first.Description, second.Description);
        Assert.Equal(first.Severity, second.Severity);
        Assert.Equal(first.RiskScore, second.RiskScore);
        Assert.Equal(
            first.PrimaryMitreTechniqueId,
            second.PrimaryMitreTechniqueId);
        Assert.Equal(
            first.PrimaryMitreTechniqueName,
            second.PrimaryMitreTechniqueName);
        Assert.Equal(
            first.MatchedRuleIds.ToArray(),
            second.MatchedRuleIds.ToArray());
        Assert.Equal(
            first.Evidence.ToArray(),
            second.Evidence.ToArray());
    }

    private static SecurityEvent Event(
        string rawPayload,
        string? processName = null) =>
        new()
        {
            Id = Guid.NewGuid(),
            EndpointId = Guid.NewGuid(),
            EventType = "endpoint.behaviour",
            Source = "simulated-windows-agent",
            EventTimestampUtc = DateTimeOffset.Parse(
                "2026-09-11T20:00:00+00:00"),
            Severity = Severity.Informational,
            ProcessName = processName,
            RawPayload = rawPayload,
            IngestedAtUtc = DateTimeOffset.Parse(
                "2026-09-11T20:00:01+00:00"),
        };
}
