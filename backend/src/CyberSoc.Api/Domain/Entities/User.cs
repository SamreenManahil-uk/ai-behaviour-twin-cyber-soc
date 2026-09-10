using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Domain.Entities;

/// <summary>Persisted User record. All timestamp values must have a zero UTC offset.</summary>
public sealed class User
{
    /// <summary>Id.</summary>
    public Guid Id { get; set; }

    /// <summary>Email.</summary>
    public required string Email
    {
        get;
        set
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(value);
            field = value.Trim().ToUpperInvariant();
        }
    }

    /// <summary>DisplayName.</summary>
    public required string DisplayName { get; set; }

    /// <summary>PasswordHash (encoded password hash only; never a plaintext password).</summary>
    public required string PasswordHash { get; set; }

    /// <summary>Role.</summary>
    public UserRole Role { get; set; }

    /// <summary>IsActive.</summary>
    public bool IsActive { get; set; }

    /// <summary>CreatedAtUtc.</summary>
    public DateTimeOffset CreatedAtUtc { get; set; }

    /// <summary>UpdatedAtUtc.</summary>
    public DateTimeOffset UpdatedAtUtc { get; set; }
}
