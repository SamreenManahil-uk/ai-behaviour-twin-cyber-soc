using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace CyberSoc.Api.Application;

internal sealed class SocExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var error = context.Exception as SocRequestException;
        var postgres = context.Exception as PostgresException ?? context.Exception.InnerException as PostgresException;
        if (postgres?.SqlState is PostgresErrorCodes.UniqueViolation or PostgresErrorCodes.ForeignKeyViolation or PostgresErrorCodes.SerializationFailure or PostgresErrorCodes.DeadlockDetected || context.Exception is DbUpdateConcurrencyException)
            error = SocRequestException.Conflict("The resource changed or conflicts with existing data. Reload and retry.");
        if (error is null) return;
        ProblemDetails problem = error.Status == 400
            ? new ValidationProblemDetails(new Dictionary<string, string[]> { [error.Field] = [error.Message] }) { Status = 400, Title = "Validation failed." }
            : new ProblemDetails { Status = error.Status, Title = error.Message };
        context.Result = new ObjectResult(problem) { StatusCode = error.Status };
        context.ExceptionHandled = true;
    }
}
