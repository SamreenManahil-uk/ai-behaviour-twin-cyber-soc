using System.Text.Json;
using CyberSoc.Api.Domain.Entities;
using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Detection;

/// <summary>
/// Deterministic rules for safely simulated endpoint-event detection.
/// Rules inspect JSON values but never execute payload content.
/// </summary>
public sealed class RuleDetectionEngine
{
    private const double LargeOutboundBytes = 50 * 1024 * 1024;

    private static readonly HashSet<string> ProxyExecutionProcesses =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "certutil.exe",
            "regsvr32.exe",
            "rundll32.exe",
            "mshta.exe",
        };

    /// <summary>Evaluates one event without modifying it or using future data.</summary>
    public RuleDetectionResult Evaluate(SecurityEvent securityEvent)
    {
        ArgumentNullException.ThrowIfNull(securityEvent);

        using var document = ParsePayload(securityEvent.RawPayload);
        var payload = document.RootElement;

        if (payload.ValueKind is not JsonValueKind.Object)
        {
            throw new ArgumentException(
                "RawPayload must contain a JSON object.",
                nameof(securityEvent));
        }

        var matches = new List<RuleMatch>();
        var processName = (
            securityEvent.ProcessName ??
            ReadString(payload, "processName", "process_name") ??
            string.Empty).Trim();

        var powershellUsed =
            ReadBoolean(
                payload,
                "powershellUsed",
                "powershell_used") is true ||
            processName.Equals(
                "powershell.exe",
                StringComparison.OrdinalIgnoreCase) ||
            processName.Equals(
                "pwsh.exe",
                StringComparison.OrdinalIgnoreCase) ||
            processName.Equals(
                "pwsh",
                StringComparison.OrdinalIgnoreCase);

        var encodedCommand = ReadBoolean(
            payload,
            "encodedCommand",
            "encoded_command") is true;

        if (encodedCommand)
        {
            matches.Add(new(
                "RULE-ENCODED-POWERSHELL",
                40m,
                "Encoded command execution",
                "Encoded command activity was declared in endpoint telemetry.",
                "T1059.001",
                "PowerShell"));
        }
        else if (powershellUsed)
        {
            matches.Add(new(
                "RULE-POWERSHELL",
                15m,
                "PowerShell activity",
                "PowerShell execution requires analyst context review.",
                "T1059.001",
                "PowerShell"));
        }

        var failedLoginCount = ReadNumber(
            payload,
            "failedLoginCount",
            "failed_login_count");

        if (failedLoginCount is >= 5)
        {
            matches.Add(new(
                "RULE-FAILED-LOGINS",
                25m,
                "Repeated authentication failures",
                $"{Math.Floor(failedLoginCount.Value)} failed login attempts were reported.",
                "T1110",
                "Brute Force"));
        }

        if (ProxyExecutionProcesses.Contains(processName))
        {
            matches.Add(new(
                "RULE-PROXY-EXECUTION",
                25m,
                "Suspicious system binary execution",
                $"{processName} can be abused for proxy execution and requires investigation.",
                "T1218",
                "System Binary Proxy Execution"));
        }

        var privilegeEvent = ReadBoolean(
            payload,
            "privilegeEvent",
            "privilege_event");

        if (privilegeEvent is true)
        {
            matches.Add(new(
                "RULE-PRIVILEGE-ACTIVITY",
                30m,
                "Privilege-related activity",
                "A privilege activity flag was reported by simulated endpoint telemetry.",
                "T1068",
                "Exploitation for Privilege Escalation"));
        }

        var outboundBytes = ReadNumber(
            payload,
            "outboundBytes",
            "outbound_bytes");

        if (outboundBytes > LargeOutboundBytes)
        {
            matches.Add(new(
                "RULE-LARGE-OUTBOUND",
                25m,
                "Large outbound transfer",
                $"{Math.Round(outboundBytes.Value / 1024 / 1024, 2)} MB of outbound traffic was reported.",
                "T1041",
                "Exfiltration Over C2 Channel"));
        }

        if (matches.Count == 0)
        {
            return RuleDetectionResult.NoMatch();
        }

        var ordered = matches
            .OrderByDescending(match => match.Weight)
            .ThenBy(match => match.RuleId, StringComparer.Ordinal)
            .ToArray();

        var score = Math.Clamp(
            ordered.Sum(match => match.Weight),
            0m,
            100m);

        var severity = score switch
        {
            >= 85m => Severity.Critical,
            >= 65m => Severity.High,
            >= 40m => Severity.Medium,
            _ => Severity.Low,
        };

        var primary = ordered[0];
        var title = ordered.Length == 1
            ? primary.Title
            : "Multiple suspicious endpoint behaviours";

        return new RuleDetectionResult
        {
            IsMatch = true,
            Title = title,
            Description =
                "Rule-based indicators require SOC analyst review. " +
                "The score is deterministic and is not an attack probability.",
            Severity = severity,
            RiskScore = score,
            PrimaryMitreTechniqueId = primary.MitreTechniqueId,
            PrimaryMitreTechniqueName = primary.MitreTechniqueName,
            MatchedRuleIds = ordered
                .Select(match => match.RuleId)
                .ToArray(),
            Evidence = ordered
                .Select(match => match.Evidence)
                .ToArray(),
        };
    }

    private static JsonDocument ParsePayload(string rawPayload)
    {
        if (string.IsNullOrWhiteSpace(rawPayload))
        {
            throw new ArgumentException(
                "RawPayload is required.",
                nameof(rawPayload));
        }

        try
        {
            return JsonDocument.Parse(
                rawPayload,
                new JsonDocumentOptions
                {
                    AllowTrailingCommas = false,
                    CommentHandling = JsonCommentHandling.Disallow,
                    MaxDepth = 16,
                });
        }
        catch (JsonException exception)
        {
            throw new ArgumentException(
                "RawPayload must be valid strict JSON.",
                nameof(rawPayload),
                exception);
        }
    }

    private static JsonElement? FindProperty(
        JsonElement payload,
        params string[] names)
    {
        foreach (var name in names)
        {
            if (payload.TryGetProperty(name, out var value))
            {
                return value;
            }
        }

        return null;
    }

    private static bool? ReadBoolean(
        JsonElement payload,
        params string[] names)
    {
        var value = FindProperty(payload, names);

        return value?.ValueKind switch
        {
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            _ => null,
        };
    }

    private static double? ReadNumber(
        JsonElement payload,
        params string[] names)
    {
        var value = FindProperty(payload, names);

        if (value is not { ValueKind: JsonValueKind.Number } ||
            !value.Value.TryGetDouble(out var number) ||
            !double.IsFinite(number) ||
            number < 0)
        {
            return null;
        }

        return number;
    }

    private static string? ReadString(
        JsonElement payload,
        params string[] names)
    {
        var value = FindProperty(payload, names);

        return value is { ValueKind: JsonValueKind.String }
            ? value.Value.GetString()
            : null;
    }

    private sealed record RuleMatch(
        string RuleId,
        decimal Weight,
        string Title,
        string Evidence,
        string MitreTechniqueId,
        string MitreTechniqueName);
}
