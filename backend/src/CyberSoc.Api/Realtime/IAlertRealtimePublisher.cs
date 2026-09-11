namespace CyberSoc.Api.Realtime;

/// <summary>Publishes safe alert summaries after successful persistence.</summary>
public interface IAlertRealtimePublisher
{
    /// <summary>Publishes a newly created alert.</summary>
    Task PublishCreatedAsync(
        AlertRealtimeMessage message,
        CancellationToken cancellationToken);

    /// <summary>Publishes an updated alert.</summary>
    Task PublishUpdatedAsync(
        AlertRealtimeMessage message,
        CancellationToken cancellationToken);
}
