namespace CyberSoc.Api.Domain.Enums;

/// <summary>Supported DetectionSource values.</summary>
public enum DetectionSource
{
    /// <summary>Rule.</summary>
    Rule,
    /// <summary>XGBoost.</summary>
    XGBoost,
    /// <summary>IsolationForest.</summary>
    IsolationForest,
    /// <summary>BehaviourTwin.</summary>
    BehaviourTwin,
    /// <summary>Hybrid.</summary>
    Hybrid,
}
