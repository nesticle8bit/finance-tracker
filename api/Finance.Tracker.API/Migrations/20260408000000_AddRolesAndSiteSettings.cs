using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finance.Tracker.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRolesAndSiteSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Ensure schemas exist
            migrationBuilder.Sql("CREATE SCHEMA IF NOT EXISTS authentications;");
            migrationBuilder.Sql("CREATE SCHEMA IF NOT EXISTS settings;");

            // Add Role column to users
            migrationBuilder.AddColumn<string>(
                name: "Role",
                schema: "authentications",
                table: "users",
                type: "text",
                nullable: false,
                defaultValue: "user");

            // Add LastSeenAt column to users
            migrationBuilder.AddColumn<DateTime>(
                name: "LastSeenAt",
                schema: "authentications",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            // Create siteSettings table
            migrationBuilder.CreateTable(
                name: "siteSettings",
                schema: "settings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SiteName = table.Column<string>(type: "text", nullable: false),
                    Slogan = table.Column<string>(type: "text", nullable: false),
                    LoginSubtitle = table.Column<string>(type: "text", nullable: false),
                    Feature1Title = table.Column<string>(type: "text", nullable: false),
                    Feature1Desc = table.Column<string>(type: "text", nullable: false),
                    Feature2Title = table.Column<string>(type: "text", nullable: false),
                    Feature2Desc = table.Column<string>(type: "text", nullable: false),
                    Feature3Title = table.Column<string>(type: "text", nullable: false),
                    Feature3Desc = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_siteSettings", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "siteSettings", schema: "settings");
            migrationBuilder.DropColumn(name: "Role", schema: "authentications", table: "users");
            migrationBuilder.DropColumn(name: "LastSeenAt", schema: "authentications", table: "users");
        }
    }
}
