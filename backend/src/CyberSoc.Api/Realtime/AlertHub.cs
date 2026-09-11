using CyberSoc.Api.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CyberSoc.Api.Realtime;

/// <summary>
/// Authorized one-way SOC notification hub.
/// Clients cannot invoke endpoint-response operations through this hub.
/// </summary>
[Authorize(Policy = SocPolicies.SocOperations)]
public sealed class AlertHub : Hub<IAlertRealtimeClient>
{
}
