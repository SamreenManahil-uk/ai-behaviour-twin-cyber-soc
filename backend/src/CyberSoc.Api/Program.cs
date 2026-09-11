using CyberSoc.Api.Detection;
using CyberSoc.Api.Authorization;
using CyberSoc.Api.Realtime;
using Microsoft.AspNetCore.Diagnostics;
using CyberSoc.Api.Configuration;
using CyberSoc.Api.Integration.Ml;
using CyberSoc.Api.Application;
using CyberSoc.Api.Authentication;
using Microsoft.OpenApi;
using CyberSoc.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSocAuthentication(builder.Configuration);
builder.Services.AddProblemDetails();
builder.Services.AddSingleton<RuleDetectionEngine>();
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = false;
    options.MaximumReceiveMessageSize = 16 * 1024;
    options.MaximumParallelInvocationsPerClient = 1;
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
}).AddJsonProtocol(options =>
{
    options.PayloadSerializerOptions.PropertyNamingPolicy =
        JsonNamingPolicy.CamelCase;
    options.PayloadSerializerOptions.Converters.Add(
        new JsonStringEnumConverter(
            JsonNamingPolicy.CamelCase,
            allowIntegerValues: false));
});
builder.Services.AddSingleton<
    IAlertRealtimePublisher,
    SignalRAlertRealtimePublisher>();
builder.Services.AddScoped<EndpointService>();
builder.Services.AddScoped<EventService>();
builder.Services.AddScoped<AlertService>();
builder.Services.AddScoped<IncidentService>();
builder.Services.AddScoped<ThreatService>();
builder.Services.AddScoped<SimulatedSoarService>();
builder.Services.AddSingleton<ISimulatedSoarExecutor, SimulatedSoarExecutor>();
builder.Services.Configure<MlServiceOptions>(
    builder.Configuration.GetSection(MlServiceOptions.SectionName));
builder.Services.AddHttpClient<IMlInferenceClient, MlInferenceClient>(client =>
{
    client.Timeout = Timeout.InfiniteTimeSpan;
});

builder.Services.AddDbContext<CyberSocDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("PostgreSql");
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException(
            "PostgreSQL persistence requires ConnectionStrings:PostgreSql. Set ConnectionStrings__PostgreSql before using database services.");
    }

    options.UseNpgsql(connectionString);
});

builder.Services.AddControllers(options => options.Filters.Add<SocExceptionFilter>()).AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.Strict;
    options.JsonSerializerOptions.Converters.Add(
        new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, allowIntegerValues: false));
});
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info.Title = "Cyber SOC API";
        document.Info.Version = "v1";
        document.Info.Description = "AI Behaviour-Twin Cyber SOC API. Provides service liveness information.";
        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes = new Dictionary<string, IOpenApiSecurityScheme>
        {
            ["Bearer"] = new OpenApiSecurityScheme { Type = SecuritySchemeType.Http, Scheme = "bearer", BearerFormat = "JWT" }
        };
        foreach (var description in context.DescriptionGroups.SelectMany(group => group.Items))
        {
            var metadata = description.ActionDescriptor.EndpointMetadata;
            if (metadata.OfType<Microsoft.AspNetCore.Authorization.IAuthorizeData>().Any() &&
                !metadata.OfType<Microsoft.AspNetCore.Authorization.IAllowAnonymous>().Any() &&
                document.Paths.TryGetValue("/" + description.RelativePath, out var path) &&
                path.Operations is not null && description.HttpMethod is not null &&
                path.Operations.TryGetValue(new HttpMethod(description.HttpMethod), out var operation))
            {
                operation.Security = [new OpenApiSecurityRequirement { [new OpenApiSecuritySchemeReference("Bearer", document)] = [] }];
            }
        }
        return Task.CompletedTask;
    });
});

var app = builder.Build();

app.UseExceptionHandler(new ExceptionHandlerOptions
{
    SuppressDiagnosticsCallback = _ => true,
    ExceptionHandler = context =>
    {
        var exception = context.Features
            .Get<IExceptionHandlerFeature>()?.Error;
        context.RequestServices
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger("SafeErrors")
            .LogError(
                exception,
                "Request failed. Trace identifier: {TraceIdentifier}",
                context.TraceIdentifier);
        return Results.Problem(statusCode: 500, title: "Unable to complete request.").ExecuteAsync(context);
    }
});
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "Cyber SOC API v1");
        options.DocumentTitle = "Cyber SOC API documentation";
    });
}

// This HTTP-only foundation has no HTTPS listener configured.
app.MapHub<AlertHub>("/hubs/alerts")
    .RequireAuthorization(SocPolicies.SocOperations);
app.MapControllers();
app.Run();

/// <summary>Application entry point exposed for integration testing.</summary>
public partial class Program;
