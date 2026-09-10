using CyberSoc.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CyberSoc.Api.Data.Configurations;

internal sealed class AlertConfiguration : IEntityTypeConfiguration<Alert>
{
    public void Configure(EntityTypeBuilder<Alert> b)
    {
        b.ToTable("alerts");
        b.HasKey(x => x.Id);
        b.Property(x => x.Title).HasMaxLength(250).IsRequired();
        b.Property(x => x.Description).HasMaxLength(4000).IsRequired();
        b.Property(x => x.Severity).HasConversion<string>().HasMaxLength(32).IsRequired();
        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(32).IsRequired();
        b.Property(x => x.DetectionSource).HasConversion<string>().HasMaxLength(32).IsRequired();
        b.Property(x => x.MitreTechniqueId).HasMaxLength(32);
        b.Property(x => x.MitreTechniqueName).HasMaxLength(200);
        b.Property(x => x.CreatedAtUtc).HasColumnType("timestamp with time zone");
        b.Property(x => x.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        b.HasOne(x => x.SecurityEvent).WithOne(x => x.Alert).HasForeignKey<Alert>(x => new { x.SecurityEventId, x.EndpointId }).HasPrincipalKey<SecurityEvent>(x => new { x.Id, x.EndpointId }).OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(x => x.SecurityEventId).IsUnique();
        b.HasOne(x => x.Endpoint).WithMany(x => x.Alerts).HasForeignKey(x => x.EndpointId).OnDelete(DeleteBehavior.Restrict);
        b.HasOne(x => x.Incident).WithMany(x => x.Alerts).HasForeignKey(x => x.IncidentId).OnDelete(DeleteBehavior.Restrict);
        b.HasIndex(x => new { x.Status, x.Severity, x.CreatedAtUtc });
        b.HasIndex(x => new { x.EndpointId, x.CreatedAtUtc });
        b.Property(x => x.RiskScore).HasPrecision(5, 2).UsePropertyAccessMode(PropertyAccessMode.Property);
        b.ToTable("alerts", table => table.HasCheckConstraint("ck_alerts_risk_score", "risk_score >= 0 AND risk_score <= 100"));
    }
}
