using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CyberSoc.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialSocSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "endpoints",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    hostname = table.Column<string>(type: "character varying(253)", maxLength: 253, nullable: false),
                    operating_system = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    agent_version = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    last_seen_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_endpoints", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "threats",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    indicator_type = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    indicator_value = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    threat_name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    confidence_score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    source = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    first_seen_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    last_seen_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_threats", x => x.id);
                    table.CheckConstraint("ck_threats_confidence_score", "confidence_score >= 0 AND confidence_score <= 100");
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    display_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    role = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                    table.CheckConstraint("ck_users_email_normalized", "email = upper(btrim(email)) AND length(email) > 0");
                });

            migrationBuilder.CreateTable(
                name: "security_events",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    endpoint_id = table.Column<Guid>(type: "uuid", nullable: false),
                    event_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    source = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    event_timestamp_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    severity = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    process_name = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    user_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    source_ip = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    destination_ip = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    raw_payload = table.Column<string>(type: "jsonb", nullable: false),
                    ingested_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_security_events", x => x.id);
                    table.UniqueConstraint("ak_security_events_id_endpoint_id", x => new { x.id, x.endpoint_id });
                    table.ForeignKey(
                        name: "fk_security_events_endpoints_endpoint_id",
                        column: x => x.endpoint_id,
                        principalTable: "endpoints",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "incidents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    severity = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    assigned_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    resolved_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_incidents", x => x.id);
                    table.ForeignKey(
                        name: "fk_incidents_users_assigned_user_id",
                        column: x => x.assigned_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "alerts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    security_event_id = table.Column<Guid>(type: "uuid", nullable: false),
                    endpoint_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    severity = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    risk_score = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    detection_source = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    mitre_technique_id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    mitre_technique_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    incident_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_alerts", x => x.id);
                    table.CheckConstraint("ck_alerts_risk_score", "risk_score >= 0 AND risk_score <= 100");
                    table.ForeignKey(
                        name: "fk_alerts_endpoints_endpoint_id",
                        column: x => x.endpoint_id,
                        principalTable: "endpoints",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_alerts_incidents_incident_id",
                        column: x => x.incident_id,
                        principalTable: "incidents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_alerts_security_events_security_event_id_endpoint_id",
                        columns: x => new { x.security_event_id, x.endpoint_id },
                        principalTable: "security_events",
                        principalColumns: new[] { "id", "endpoint_id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_alerts_endpoint_id_created_at_utc",
                table: "alerts",
                columns: new[] { "endpoint_id", "created_at_utc" });

            migrationBuilder.CreateIndex(
                name: "ix_alerts_incident_id",
                table: "alerts",
                column: "incident_id");

            migrationBuilder.CreateIndex(
                name: "ix_alerts_security_event_id",
                table: "alerts",
                column: "security_event_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_alerts_security_event_id_endpoint_id",
                table: "alerts",
                columns: new[] { "security_event_id", "endpoint_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_alerts_status_severity_created_at_utc",
                table: "alerts",
                columns: new[] { "status", "severity", "created_at_utc" });

            migrationBuilder.CreateIndex(
                name: "ix_endpoints_hostname",
                table: "endpoints",
                column: "hostname",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_endpoints_status_last_seen_at_utc",
                table: "endpoints",
                columns: new[] { "status", "last_seen_at_utc" });

            migrationBuilder.CreateIndex(
                name: "ix_incidents_assigned_user_id",
                table: "incidents",
                column: "assigned_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_incidents_status_severity_created_at_utc",
                table: "incidents",
                columns: new[] { "status", "severity", "created_at_utc" });

            migrationBuilder.CreateIndex(
                name: "ix_security_events_endpoint_id_event_timestamp_utc",
                table: "security_events",
                columns: new[] { "endpoint_id", "event_timestamp_utc" });

            migrationBuilder.CreateIndex(
                name: "ix_security_events_event_timestamp_utc",
                table: "security_events",
                column: "event_timestamp_utc");

            migrationBuilder.CreateIndex(
                name: "ix_threats_indicator_type_indicator_value",
                table: "threats",
                columns: new[] { "indicator_type", "indicator_value" });

            migrationBuilder.CreateIndex(
                name: "ix_threats_is_active_last_seen_at_utc",
                table: "threats",
                columns: new[] { "is_active", "last_seen_at_utc" });

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "alerts");

            migrationBuilder.DropTable(
                name: "threats");

            migrationBuilder.DropTable(
                name: "incidents");

            migrationBuilder.DropTable(
                name: "security_events");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "endpoints");
        }
    }
}
