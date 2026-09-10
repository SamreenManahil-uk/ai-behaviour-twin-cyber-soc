using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Validation;

/// <summary>Requires an explicitly UTC, nondefault timestamp.</summary>
public sealed class UtcAttribute : ValidationAttribute
{
    /// <inheritdoc />
    public override bool IsValid(object? value) => value is null || value is DateTimeOffset date && date != default && date.Offset == TimeSpan.Zero;
    /// <inheritdoc />
    public override string FormatErrorMessage(string name) => $"{name} must be a nondefault UTC timestamp with zero offset.";
}

/// <summary>Rejects empty resource identifiers.</summary>
public sealed class NotEmptyGuidAttribute : ValidationAttribute
{
    /// <inheritdoc />
    public override bool IsValid(object? value) => value is null || value is Guid id && id != Guid.Empty;
    /// <inheritdoc />
    public override string FormatErrorMessage(string name) => $"{name} must be a nonempty UUID.";
}

/// <summary>Rejects whitespace-only strings while permitting optional nulls.</summary>
public sealed class NotBlankAttribute : ValidationAttribute
{
    /// <inheritdoc />
    public override bool IsValid(object? value) => value is null || value is string text && !string.IsNullOrWhiteSpace(text);
}

/// <summary>Validates optional IPv4/IPv6 addresses.</summary>
public sealed class IpAddressAttribute : ValidationAttribute
{
    /// <inheritdoc />
    public override bool IsValid(object? value) => value is null || value is string text && SocInput.IsIp(text);
}

/// <summary>Validates bounded untrusted JSON text without executing it.</summary>
public sealed class JsonPayloadAttribute : ValidationAttribute
{
    /// <inheritdoc />
    public override bool IsValid(object? value)
    {
        if (value is not string text || Encoding.UTF8.GetByteCount(text) > 65536) return false;
        try { using var document = JsonDocument.Parse(text, new JsonDocumentOptions { MaxDepth = 64 }); return true; }
        catch (JsonException) { return false; }
    }
    /// <inheritdoc />
    public override string FormatErrorMessage(string name) => $"{name} must be valid JSON, at most 65536 UTF-8 bytes and 64 levels deep.";
}

/// <summary>Pure normalization and validation for resource identifiers.</summary>
public static class SocInput
{
    /// <summary>Validates conventional IPv4 or IPv6 literals, excluding scoped addresses.</summary>
    public static bool IsIp(string text) => !text.Contains('%') && IPAddress.TryParse(text, out _) &&
        (text.Contains(':') || Regex.IsMatch(text, @"^\d{1,3}(\.\d{1,3}){3}$"));
    /// <summary>Normalizes a DNS-style hostname.</summary>
    public static string Hostname(string text) => text.Trim().TrimEnd('.').ToLowerInvariant();
    /// <summary>Accepts bounded DNS labels, including single-label registered hostnames.</summary>
    public static bool IsHostname(string text) => text.Length is > 0 and <= 253 && text.Split('.').All(label =>
        Regex.IsMatch(label, "^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$"));
    /// <summary>Normalizes and validates an indicator; null indicates invalid input.</summary>
    public static string? Indicator(IndicatorType type, string value)
    {
        var text = value.Trim();
        return type switch
        {
            IndicatorType.IpAddress when IsIp(text) => IPAddress.Parse(text).ToString(),
            IndicatorType.Domain when IsHostname(Hostname(text)) && Hostname(text).Contains('.') && !IsIp(text) => Hostname(text),
            IndicatorType.FileHash when Regex.IsMatch(text, "^[a-fA-F0-9]{64}$") => text.ToLowerInvariant(),
            IndicatorType.Url when Uri.TryCreate(text, UriKind.Absolute, out var uri) &&
                uri.Scheme is "http" or "https" && !string.IsNullOrEmpty(uri.Host) && string.IsNullOrEmpty(uri.UserInfo) => uri.AbsoluteUri,
            IndicatorType.Process when text.Length is > 0 and <= 512 && !text.Any(char.IsControl) => text,
            _ => null
        };
    }
}
