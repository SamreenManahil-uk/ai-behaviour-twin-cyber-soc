using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace CyberSoc.Api.Contracts.Ml;

/// <summary>One raw network-flow event for internal ML inference.</summary>
public sealed record NetworkPredictionRequest(
    [param: Required, MinLength(1)]
    Dictionary<string, JsonElement> Features);
