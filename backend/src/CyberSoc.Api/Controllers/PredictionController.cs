using CyberSoc.Api.Authorization;
using CyberSoc.Api.Contracts.Ml;
using CyberSoc.Api.Integration.Ml;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CyberSoc.Api.Controllers;

/// <summary>Authorized access to the internal network threat-detection service.</summary>
[ApiController]
[Route("api/predict")]
[Authorize(Policy = SocPolicies.SocOperations)]
[RequestSizeLimit(300000)]
public sealed class PredictionController(IMlInferenceClient client) : ControllerBase
{
    /// <summary>
    /// Returns supervised threat and unsupervised anomaly signals for one network event.
    /// </summary>
    [HttpPost]
    [ProducesResponseType<NetworkPredictionResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status422UnprocessableEntity)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status502BadGateway)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status503ServiceUnavailable)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status504GatewayTimeout)]
    public async Task<ActionResult<NetworkPredictionResponse>> Predict(
        NetworkPredictionRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await client.PredictNetworkAsync(request, cancellationToken));
        }
        catch (MlServiceException exception)
        {
            return Problem(
                statusCode: exception.StatusCode,
                title: exception.Title);
        }
    }
}
