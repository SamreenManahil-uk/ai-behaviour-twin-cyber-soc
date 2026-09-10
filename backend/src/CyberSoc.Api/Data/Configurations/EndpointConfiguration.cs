using Endpoint = CyberSoc.Api.Domain.Entities.Endpoint;
using CyberSoc.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CyberSoc.Api.Data.Configurations;

internal sealed class EndpointConfiguration : IEntityTypeConfiguration<Endpoint>
{
    public void Configure(EntityTypeBuilder<Endpoint> b)
    {
        b.ToTable("endpoints");
        b.HasKey(x => x.Id);
        b.Property(x => x.Hostname).HasMaxLength(253).IsRequired();
        b.Property(x => x.OperatingSystem).HasConversion<string>().HasMaxLength(32).IsRequired();
        b.Property(x => x.IpAddress).HasMaxLength(45);
        b.Property(x => x.AgentVersion).HasMaxLength(100);
        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(32).IsRequired();
        b.Property(x => x.LastSeenAtUtc).HasColumnType("timestamp with time zone");
        b.Property(x => x.CreatedAtUtc).HasColumnType("timestamp with time zone");
        b.HasIndex(x => x.Hostname).IsUnique();
        b.HasIndex(x => new { x.Status, x.LastSeenAtUtc });
    }
}
