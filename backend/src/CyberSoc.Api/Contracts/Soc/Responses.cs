using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using CyberSoc.Api.Domain.Enums;
using CyberSoc.Api.Validation;

namespace CyberSoc.Api.Contracts.Soc;

/// <summary>Public EndpointResponse contract without persistence navigations or credentials.</summary>
/// <param name="Id">Id.</param>
/// <param name="Hostname">Hostname.</param>
/// <param name="OperatingSystem">OperatingSystem.</param>
/// <param name="IpAddress">IpAddress.</param>
/// <param name="AgentVersion">AgentVersion.</param>
/// <param name="Status">Status.</param>
/// <param name="LastSeenAtUtc">LastSeenAtUtc.</param>
/// <param name="CreatedAtUtc">CreatedAtUtc.</param>
public sealed record EndpointResponse(Guid Id, string Hostname, EndpointOperatingSystem OperatingSystem, string? IpAddress, string? AgentVersion, EndpointStatus Status, DateTimeOffset LastSeenAtUtc, DateTimeOffset CreatedAtUtc);

/// <summary>Public EventResponse contract without persistence navigations or credentials.</summary>
/// <param name="Id">Id.</param>
/// <param name="EndpointId">EndpointId.</param>
/// <param name="EventType">EventType.</param>
/// <param name="Source">Source.</param>
/// <param name="EventTimestampUtc">EventTimestampUtc.</param>
/// <param name="Severity">Severity.</param>
/// <param name="ProcessName">ProcessName.</param>
/// <param name="UserName">UserName.</param>
/// <param name="SourceIp">SourceIp.</param>
/// <param name="DestinationIp">DestinationIp.</param>
/// <param name="RawPayload">RawPayload.</param>
/// <param name="IngestedAtUtc">IngestedAtUtc.</param>
public sealed record EventResponse(Guid Id, Guid EndpointId, string EventType, string Source, DateTimeOffset EventTimestampUtc, Severity Severity, string? ProcessName, string? UserName, string? SourceIp, string? DestinationIp, string RawPayload, DateTimeOffset IngestedAtUtc);

/// <summary>Public AlertResponse contract without persistence navigations or credentials.</summary>
/// <param name="Id">Id.</param>
/// <param name="SecurityEventId">SecurityEventId.</param>
/// <param name="EndpointId">EndpointId.</param>
/// <param name="Title">Title.</param>
/// <param name="Description">Description.</param>
/// <param name="Severity">Severity.</param>
/// <param name="Status">Status.</param>
/// <param name="RiskScore">RiskScore.</param>
/// <param name="DetectionSource">DetectionSource.</param>
/// <param name="MitreTechniqueId">MitreTechniqueId.</param>
/// <param name="MitreTechniqueName">MitreTechniqueName.</param>
/// <param name="CreatedAtUtc">CreatedAtUtc.</param>
/// <param name="UpdatedAtUtc">UpdatedAtUtc.</param>
/// <param name="IncidentId">IncidentId.</param>
public sealed record AlertResponse(Guid Id, Guid SecurityEventId, Guid EndpointId, string Title, string Description, Severity Severity, AlertStatus Status, decimal RiskScore, DetectionSource DetectionSource, string? MitreTechniqueId, string? MitreTechniqueName, DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc, Guid? IncidentId);

/// <summary>Public IncidentResponse contract without persistence navigations or credentials.</summary>
/// <param name="Id">Id.</param>
/// <param name="Title">Title.</param>
/// <param name="Description">Description.</param>
/// <param name="Severity">Severity.</param>
/// <param name="Status">Status.</param>
/// <param name="AssignedUserId">AssignedUserId.</param>
/// <param name="CreatedAtUtc">CreatedAtUtc.</param>
/// <param name="UpdatedAtUtc">UpdatedAtUtc.</param>
/// <param name="ResolvedAtUtc">ResolvedAtUtc.</param>
public sealed record IncidentResponse(Guid Id, string Title, string Description, Severity Severity, IncidentStatus Status, Guid? AssignedUserId, DateTimeOffset CreatedAtUtc, DateTimeOffset UpdatedAtUtc, DateTimeOffset? ResolvedAtUtc);

/// <summary>Public ThreatResponse contract without persistence navigations or credentials.</summary>
/// <param name="Id">Id.</param>
/// <param name="IndicatorType">IndicatorType.</param>
/// <param name="IndicatorValue">IndicatorValue.</param>
/// <param name="ThreatName">ThreatName.</param>
/// <param name="Description">Description.</param>
/// <param name="ConfidenceScore">ConfidenceScore.</param>
/// <param name="Source">Source.</param>
/// <param name="IsActive">IsActive.</param>
/// <param name="FirstSeenAtUtc">FirstSeenAtUtc.</param>
/// <param name="LastSeenAtUtc">LastSeenAtUtc.</param>
/// <param name="CreatedAtUtc">CreatedAtUtc.</param>
public sealed record ThreatResponse(Guid Id, IndicatorType IndicatorType, string IndicatorValue, string ThreatName, string? Description, decimal ConfidenceScore, string Source, bool IsActive, DateTimeOffset FirstSeenAtUtc, DateTimeOffset LastSeenAtUtc, DateTimeOffset CreatedAtUtc);

/// <summary>Public ResourceSummary contract without persistence navigations or credentials.</summary>
/// <param name="Id">Id.</param>
/// <param name="Label">Label.</param>
public sealed record ResourceSummary(Guid Id, string Label);

/// <summary>Public AlertDetailResponse contract without persistence navigations or credentials.</summary>
/// <param name="Alert">Alert.</param>
/// <param name="Endpoint">Endpoint.</param>
/// <param name="Event">Event.</param>
/// <param name="Incident">Incident.</param>
public sealed record AlertDetailResponse(AlertResponse Alert, ResourceSummary Endpoint, ResourceSummary Event, ResourceSummary? Incident);

/// <summary>Public IncidentDetailResponse contract without persistence navigations or credentials.</summary>
/// <param name="Incident">Incident.</param>
/// <param name="Alerts">Alerts.</param>
public sealed record IncidentDetailResponse(IncidentResponse Incident, IReadOnlyList<AlertResponse> Alerts);

