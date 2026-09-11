using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Detection;

/// <summary>Explainable result from deterministic endpoint-event rules.</summary>
public sealed record RuleDetectionResult
{
    /// <summary>Whether at least one rule matched.</summary>
    public required bool IsMatch { get; init; }

    /// <summary>Bounded alert title.</summary>
    public required string Title { get; init; }

    /// <summary>Explanation of the detection methodology.</summary>
    public required string Description { get; init; }

    /// <summary>Derived severity.</summary>
    public required Severity Severity { get; init; }

    /// <summary>
    /// Deterministic score from zero to one hundred; not an attack probability.
    /// </summary>
    public required decimal RiskScore { get; init; }

    /// <summary>Primary MITRE ATT&amp;CK technique identifier.</summary>
    public string? PrimaryMitreTechniqueId { get; init; }

    /// <summary>Primary MITRE ATT&amp;CK technique name.</summary>
    public string? PrimaryMitreTechniqueName { get; init; }

    /// <summary>Deterministically ordered matched rule identifiers.</summary>
    public required IReadOnlyList<string> MatchedRuleIds { get; init; }

    /// <summary>Human-readable evidence for analyst review.</summary>
    public required IReadOnlyList<string> Evidence { get; init; }

    /// <summary>Creates a result representing no suspicious rule match.</summary>
    public static RuleDetectionResult NoMatch() =>
        new()
        {
            IsMatch = false,
            Title = "No rule match",
            Description =
                "No configured deterministic endpoint rule matched.",
            Severity = Severity.Informational,
            RiskScore = 0m,
            MatchedRuleIds = [],
            Evidence = [],
        };
}
