namespace CyberSoc.Api.Application;

internal sealed class SocRequestException(int status, string message, string field = "request") : Exception(message)
{
    public int Status { get; } = status;
    public string Field { get; } = field;
    public static SocRequestException Missing() => new(404, "Resource not found.");
    public static SocRequestException Invalid(string message, string field) => new(400, message, field);
    public static SocRequestException Conflict(string message) => new(409, message);
}
