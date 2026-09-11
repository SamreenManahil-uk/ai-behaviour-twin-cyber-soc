using CyberSoc.Api.Domain.Entities;
using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Realtime;

namespace CyberSoc.Api.Tests;

public sealed class AlertRealtimeMapperTests
{
    [Fact]
    public void MapsOnlySafeAlertSummaryFields()
    {
        var alertId = Guid.NewGuid();
        var endpointId = Guid.NewGuid();
        var updatedAt = DateTimeOffset.Parse(
            "2026-09-11T20:00:00+00:00");

        var alert = new Alert
        {
            Id = alertId,
            SecurityEventId = Guid.NewGuid(),
            EndpointId = endpointId,
            Title = "Encoded PowerShell execution",
            Description = "Detailed evidence remains in the REST resource.",
            Severity = Severity.Critical,
            Status = AlertStatus.Investigating,
            RiskScore = 96.25m,
            DetectionSource = DetectionSource.Hybrid,
            MitreTechniqueId = "T1059.001",
            MitreTechniqueName = "PowerShell",
            CreatedAtUtc = updatedAt.AddMinutes(-5),
            UpdatedAtUtc = updatedAt,
        };

        var message = AlertRealtimeMapper.Map(alert);

        Assert.Equal(alertId, message.AlertId);
        Assert.Equal(endpointId, message.EndpointId);
        Assert.Equal(alert.Title, message.Title);
        Assert.Equal(Severity.Critical, message.Severity);
        Assert.Equal(AlertStatus.Investigating, message.Status);
        Assert.Equal(96.25m, message.RiskScore);
        Assert.Equal(DetectionSource.Hybrid, message.DetectionSource);
        Assert.Equal("T1059.001", message.MitreTechniqueId);
        Assert.Equal(updatedAt, message.OccurredAtUtc);
    }

    [Fact]
    public void RejectsNullAlert()
    {
        Assert.Throws<ArgumentNullException>(
            () => AlertRealtimeMapper.Map(null!));
    }
}
