using CyberSoc.Api.Detection;
using CyberSoc.Api.Domain.Entities;
using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Application;

/// <summary>Creates a persisted rule alert from a trusted detection result.</summary>
public static class RuleAlertFactory
{
    /// <summary>Maps one matched detection to one alert.</summary>
    public static Alert Create(
        SecurityEvent securityEvent,
        RuleDetectionResult detection,
        DateTimeOffset createdAtUtc)
    {
        ArgumentNullException.ThrowIfNull(securityEvent);
        ArgumentNullException.ThrowIfNull(detection);

        if (!detection.IsMatch)
        {
            throw new InvalidOperationException(
                "An alert cannot be created from a non-matching detection.");
        }

        if (createdAtUtc.Offset != TimeSpan.Zero)
        {
            throw new ArgumentException(
                "Alert timestamp must have a zero UTC offset.",
                nameof(createdAtUtc));
        }

        var evidence = detection.Evidence.Count == 0
            ? "No additional rule evidence."
            : string.Join(" | ", detection.Evidence);

        var description =
            $"{detection.Description} Evidence: {evidence}";

        if (description.Length > 4000)
        {
            description = description[..4000];
        }

        return new Alert
        {
            Id = Guid.NewGuid(),
            SecurityEventId = securityEvent.Id,
            EndpointId = securityEvent.EndpointId,
            Title = detection.Title,
            Description = description,
            Severity = detection.Severity,
            Status = AlertStatus.New,
            RiskScore = detection.RiskScore,
            DetectionSource = DetectionSource.Rule,
            MitreTechniqueId =
                detection.PrimaryMitreTechniqueId,
            MitreTechniqueName =
                detection.PrimaryMitreTechniqueName,
            CreatedAtUtc = createdAtUtc,
            UpdatedAtUtc = createdAtUtc,
        };
    }
}
