using CyberSoc.Api.Domain.Enums;

namespace CyberSoc.Api.Domain.Entities;

/// <summary>Persisted Incident record. All timestamp values must have a zero UTC offset.</summary>
public sealed class Incident
{
    /// <summary>Id.</summary>
    public Guid Id { get; set; }

    /// <summary>Title.</summary>
    public required string Title { get; set; }

    /// <summary>Description.</summary>
    public required string Description { get; set; }

    /// <summary>Severity.</summary>
    public Severity Severity { get; set; }

    /// <summary>Status.</summary>
    public IncidentStatus Status { get; set; }

    /// <summary>AssignedUserId.</summary>
    public Guid? AssignedUserId { get; set; }

    /// <summary>AssignedUser.</summary>
    public User? AssignedUser { get; set; }

    /// <summary>CreatedAtUtc.</summary>
    public DateTimeOffset CreatedAtUtc { get; set; }

    /// <summary>UpdatedAtUtc.</summary>
    public DateTimeOffset UpdatedAtUtc { get; set; }

    /// <summary>ResolvedAtUtc.</summary>
    public DateTimeOffset? ResolvedAtUtc { get; set; }

    /// <summary>Alerts.</summary>
    public ICollection<Alert> Alerts { get; } = [];
}
