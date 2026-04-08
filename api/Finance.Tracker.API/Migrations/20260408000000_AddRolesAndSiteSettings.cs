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
            // Add Role column to Users
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "user");

            // Add LastSeenAt column to Users
            migrationBuilder.AddColumn<DateTime>(
                name: "LastSeenAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            // Create SiteSettings table
            migrationBuilder.CreateTable(
                name: "SiteSettings",
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
                    table.PrimaryKey("PK_SiteSettings", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "SiteSettings");
            migrationBuilder.DropColumn(name: "Role", table: "Users");
            migrationBuilder.DropColumn(name: "LastSeenAt", table: "Users");
        }
    }
}
