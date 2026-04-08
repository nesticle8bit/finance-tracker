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
            migrationBuilder.Sql("CREATE SCHEMA IF NOT EXISTS authentications;");
            migrationBuilder.Sql("CREATE SCHEMA IF NOT EXISTS settings;");

            migrationBuilder.Sql(@"
                ALTER TABLE authentications.users
                    ADD COLUMN IF NOT EXISTS ""Role"" text NOT NULL DEFAULT 'user';
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE authentications.users
                    ADD COLUMN IF NOT EXISTS ""LastSeenAt"" timestamp with time zone;
            ");

            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS settings.""siteSettings"" (
                    ""Id""            uuid NOT NULL,
                    ""SiteName""      text NOT NULL DEFAULT 'Finance Tracker',
                    ""Slogan""        text NOT NULL DEFAULT 'Controla tus finanzas, transforma tu futuro.',
                    ""LoginSubtitle"" text NOT NULL DEFAULT 'Registra ingresos, gastos y presupuestos en un solo lugar.',
                    ""Feature1Title"" text NOT NULL DEFAULT 'Análisis visual',
                    ""Feature1Desc""  text NOT NULL DEFAULT 'Gráficas claras de tus movimientos diarios',
                    ""Feature2Title"" text NOT NULL DEFAULT 'Presupuesto inteligente',
                    ""Feature2Desc""  text NOT NULL DEFAULT 'Define límites por categoría y evita sobregastos',
                    ""Feature3Title"" text NOT NULL DEFAULT 'Datos seguros',
                    ""Feature3Desc""  text NOT NULL DEFAULT 'Autenticación JWT, tus datos solo son tuyos',
                    CONSTRAINT ""PK_siteSettings"" PRIMARY KEY (""Id"")
                );
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP TABLE IF EXISTS settings.""siteSettings"";");
            migrationBuilder.Sql(@"ALTER TABLE authentications.users DROP COLUMN IF EXISTS ""Role"";");
            migrationBuilder.Sql(@"ALTER TABLE authentications.users DROP COLUMN IF EXISTS ""LastSeenAt"";");
        }
    }
}
