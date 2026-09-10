using CyberSoc.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CyberSoc.Api.Data.Configurations;

internal sealed class ThreatConfiguration : IEntityTypeConfiguration<Threat>
{
    public void Configure(EntityTypeBuilder<Threat> b)
    {
        b.ToTable("threats");
        b.HasKey(x => x.Id);
        b.Property(x => x.IndicatorType).HasConversion<string>().HasMaxLength(32).IsRequired();
        b.Property(x => x.IndicatorValue).HasMaxLength(2048).IsRequired();
        b.Property(x => x.ThreatName).HasMaxLength(250).IsRequired();
        b.Property(x => x.Description).HasMaxLength(4000);
        b.Property(x => x.Source).HasMaxLength(200).IsRequired();
        b.Property(x => x.FirstSeenAtUtc).HasColumnType("timestamp with time zone");
        b.Property(x => x.LastSeenAtUtc).HasColumnType("timestamp with time zone");
        b.Property(x => x.CreatedAtUtc).HasColumnType("timestamp with time zone");
        b.HasIndex(x => new { x.IndicatorType, x.IndicatorValue });
        b.HasIndex(x => new { x.IsActive, x.LastSeenAtUtc });
        b.Property(x => x.ConfidenceScore).HasPrecision(5, 2).UsePropertyAccessMode(PropertyAccessMode.Property);
        b.ToTable("threats", table => table.HasCheckConstraint("ck_threats_confidence_score", "confidence_score >= 0 AND confidence_score <= 100"));
    }
}
