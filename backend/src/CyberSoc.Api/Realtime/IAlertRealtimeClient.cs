namespace CyberSoc.Api.Realtime;

/// <summary>Strongly typed messages available to authorized SOC clients.</summary>
public interface IAlertRealtimeClient
{
    /// <summary>Receives a newly persisted alert summary.</summary>
    Task AlertCreated(AlertRealtimeMessage message);

    /// <summary>Receives an update to an existing persisted alert.</summary>
    Task AlertUpdated(AlertRealtimeMessage message);
}
