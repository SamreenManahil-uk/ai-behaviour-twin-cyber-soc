using System.Linq.Expressions;
using CyberSoc.Api.Contracts.Soc;
using CyberSoc.Api.Domain.Entities;
using Endpoint = CyberSoc.Api.Domain.Entities.Endpoint;

namespace CyberSoc.Api.Application;

internal static class SocMapping
{
    public static readonly Expression<Func<Endpoint, EndpointResponse>> Endpoint = x => new(x.Id, x.Hostname, x.OperatingSystem, x.IpAddress, x.AgentVersion, x.Status, x.LastSeenAtUtc, x.CreatedAtUtc);
    public static EndpointResponse Map(Endpoint x) => new(x.Id, x.Hostname, x.OperatingSystem, x.IpAddress, x.AgentVersion, x.Status, x.LastSeenAtUtc, x.CreatedAtUtc);
    public static readonly Expression<Func<SecurityEvent, EventResponse>> Event = x => new(x.Id, x.EndpointId, x.EventType, x.Source, x.EventTimestampUtc, x.Severity, x.ProcessName, x.UserName, x.SourceIp, x.DestinationIp, x.RawPayload, x.IngestedAtUtc);
    public static EventResponse Map(SecurityEvent x) => new(x.Id, x.EndpointId, x.EventType, x.Source, x.EventTimestampUtc, x.Severity, x.ProcessName, x.UserName, x.SourceIp, x.DestinationIp, x.RawPayload, x.IngestedAtUtc);
    public static readonly Expression<Func<Alert, AlertResponse>> Alert = x => new(x.Id, x.SecurityEventId, x.EndpointId, x.Title, x.Description, x.Severity, x.Status, x.RiskScore, x.DetectionSource, x.MitreTechniqueId, x.MitreTechniqueName, x.CreatedAtUtc, x.UpdatedAtUtc, x.IncidentId);
    public static AlertResponse Map(Alert x) => new(x.Id, x.SecurityEventId, x.EndpointId, x.Title, x.Description, x.Severity, x.Status, x.RiskScore, x.DetectionSource, x.MitreTechniqueId, x.MitreTechniqueName, x.CreatedAtUtc, x.UpdatedAtUtc, x.IncidentId);
    public static readonly Expression<Func<Incident, IncidentResponse>> Incident = x => new(x.Id, x.Title, x.Description, x.Severity, x.Status, x.AssignedUserId, x.CreatedAtUtc, x.UpdatedAtUtc, x.ResolvedAtUtc);
    public static IncidentResponse Map(Incident x) => new(x.Id, x.Title, x.Description, x.Severity, x.Status, x.AssignedUserId, x.CreatedAtUtc, x.UpdatedAtUtc, x.ResolvedAtUtc);
    public static readonly Expression<Func<Threat, ThreatResponse>> Threat = x => new(x.Id, x.IndicatorType, x.IndicatorValue, x.ThreatName, x.Description, x.ConfidenceScore, x.Source, x.IsActive, x.FirstSeenAtUtc, x.LastSeenAtUtc, x.CreatedAtUtc);
    public static ThreatResponse Map(Threat x) => new(x.Id, x.IndicatorType, x.IndicatorValue, x.ThreatName, x.Description, x.ConfidenceScore, x.Source, x.IsActive, x.FirstSeenAtUtc, x.LastSeenAtUtc, x.CreatedAtUtc);
}
