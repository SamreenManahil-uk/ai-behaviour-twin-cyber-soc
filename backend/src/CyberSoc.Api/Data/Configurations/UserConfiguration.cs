using CyberSoc.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CyberSoc.Api.Data.Configurations;

internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> b)
    {
        b.ToTable("users");
        b.HasKey(x => x.Id);
        b.Property(x => x.Email).HasMaxLength(320).IsRequired();
        b.Property(x => x.DisplayName).HasMaxLength(200).IsRequired();
        b.Property(x => x.PasswordHash).HasMaxLength(1024).IsRequired();
        b.Property(x => x.Role).HasConversion<string>().HasMaxLength(32).IsRequired();
        b.Property(x => x.CreatedAtUtc).HasColumnType("timestamp with time zone");
        b.Property(x => x.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        b.HasIndex(x => x.Email).IsUnique();
        b.ToTable("users", table => table.HasCheckConstraint("ck_users_email_normalized", "email = upper(btrim(email)) AND length(email) > 0"));
        b.Property(x => x.Email).UsePropertyAccessMode(PropertyAccessMode.Property);
    }
}
