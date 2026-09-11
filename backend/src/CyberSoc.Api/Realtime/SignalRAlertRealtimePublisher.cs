using Microsoft.AspNetCore.SignalR;

namespace CyberSoc.Api.Realtime;

/// <summary>SignalR implementation of the authorized alert publisher.</summary>
public sealed class SignalRAlertRealtimePublisher(
    IHubContext<AlertHub, IAlertRealtimeClient> hubContext)
    : IAlertRealtimePublisher
{
    /// <inheritdoc />
    public Task PublishCreatedAsync(
        AlertRealtimeMessage message,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        cancellationToken.ThrowIfCancellationRequested();

        return hubContext.Clients.All.AlertCreated(message);
    }

    /// <inheritdoc />
    public Task PublishUpdatedAsync(
        AlertRealtimeMessage message,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        cancellationToken.ThrowIfCancellationRequested();

        return hubContext.Clients.All.AlertUpdated(message);
    }
}
