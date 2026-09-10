using CyberSoc.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CyberSoc.Api.Data.Configurations;

internal sealed class SecurityEventConfiguration : IEntityTypeConfiguration<SecurityEvent>
{
    public void Configure(EntityTypeBuilder<SecurityEvent> b)
    {
        b.ToTable("security_events");
        b.HasKey(x => x.Id);
        b.Property(x => x.EventType).HasMaxLength(100).IsRequired();
        b.Property(x => x.Source).HasMaxLength(200).IsRequired();
        b.Property(x => x.EventTimestampUtc).HasColumnType("timestamp with time zone");
        b.Property(x => x.Severity).HasConversion<string>().HasMaxLength(32).IsRequired();
        b.Property(x => x.ProcessName).HasMaxLength(512);
        b.Property(x => x.UserName).HasMaxLength(256);
        b.Property(x => x.SourceIp).HasMaxLength(45);
        b.Property(x => x.DestinationIp).HasMaxLength(45);
        b.Property(x => x.RawPayload).IsRequired();
        b.Property(x => x.IngestedAtUtc).HasColumnType("timestamp with time zone");
        b.HasOne(x => x.Endpoint).WithMany(x => x.SecurityEvents).HasForeignKey(x => x.EndpointId).OnDelete(DeleteBehavior.Restrict);
        b.HasAlternateKey(x => new { x.Id, x.EndpointId });
        b.HasIndex(x => new { x.EndpointId, x.EventTimestampUtc });
        b.HasIndex(x => x.EventTimestampUtc);
        b.Property(x => x.RawPayload).HasColumnType("jsonb");
    }
}
