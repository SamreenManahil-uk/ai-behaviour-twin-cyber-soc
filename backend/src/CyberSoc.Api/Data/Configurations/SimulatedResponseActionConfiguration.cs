using CyberSoc.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CyberSoc.Api.Data.Configurations;

internal sealed class SimulatedResponseActionConfiguration :
    IEntityTypeConfiguration<SimulatedResponseAction>
{
    public void Configure(EntityTypeBuilder<SimulatedResponseAction> b)
    {
        b.ToTable(
            "simulated_response_actions",
            table => table.HasCheckConstraint(
                "ck_simulated_response_actions_simulation_only",
                "is_simulation = TRUE"));

        b.HasKey(x => x.Id);

        b.Property(x => x.ActionType)
            .HasConversion<string>()
            .HasMaxLength(40)
            .IsRequired();

        b.Property(x => x.Target)
            .HasMaxLength(512)
            .IsRequired();

        b.Property(x => x.Reason)
            .HasMaxLength(1000)
            .IsRequired();

        b.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(40)
            .IsRequired();

        b.Property(x => x.ResultSummary)
            .HasMaxLength(1000)
            .IsRequired();

        b.Property(x => x.IsSimulation)
            .IsRequired();

        b.Property(x => x.RequestedAtUtc)
            .HasColumnType("timestamp with time zone");

        b.Property(x => x.CompletedAtUtc)
            .HasColumnType("timestamp with time zone");

        b.HasOne<Alert>()
            .WithMany()
            .HasForeignKey(x => x.AlertId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasOne<CyberSoc.Api.Domain.Entities.Endpoint>()
            .WithMany()
            .HasForeignKey(x => x.EndpointId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.RequestedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        b.HasIndex(x => new { x.AlertId, x.RequestedAtUtc });
        b.HasIndex(x => new { x.RequestedByUserId, x.RequestedAtUtc });
    }
}
