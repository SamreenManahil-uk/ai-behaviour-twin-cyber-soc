using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CyberSoc.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSimulatedSoarAudit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "simulated_response_actions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    alert_id = table.Column<Guid>(type: "uuid", nullable: false),
                    endpoint_id = table.Column<Guid>(type: "uuid", nullable: false),
                    requested_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    action_type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    target = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    result_summary = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    is_simulation = table.Column<bool>(type: "boolean", nullable: false),
                    requested_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    completed_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_simulated_response_actions", x => x.id);
                    table.CheckConstraint("ck_simulated_response_actions_simulation_only", "is_simulation = TRUE");
                    table.ForeignKey(
                        name: "fk_simulated_response_actions_alerts_alert_id",
                        column: x => x.alert_id,
                        principalTable: "alerts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_simulated_response_actions_endpoints_endpoint_id",
                        column: x => x.endpoint_id,
                        principalTable: "endpoints",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_simulated_response_actions_users_requested_by_user_id",
                        column: x => x.requested_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_simulated_response_actions_alert_id_requested_at_utc",
                table: "simulated_response_actions",
                columns: new[] { "alert_id", "requested_at_utc" });

            migrationBuilder.CreateIndex(
                name: "ix_simulated_response_actions_endpoint_id",
                table: "simulated_response_actions",
                column: "endpoint_id");

            migrationBuilder.CreateIndex(
                name: "ix_simulated_response_actions_requested_by_user_id_requested_a~",
                table: "simulated_response_actions",
                columns: new[] { "requested_by_user_id", "requested_at_utc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "simulated_response_actions");
        }
    }
}
