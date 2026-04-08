using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finance.Tracker.API.Migrations
{
    /// <inheritdoc />
    public partial class EditTables__Renames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BudgetConfigs_Users_UserId",
                table: "BudgetConfigs");

            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Users_UserId",
                table: "Categories");

            migrationBuilder.DropForeignKey(
                name: "FK_CategoryLimits_Categories_CategoryId",
                table: "CategoryLimits");

            migrationBuilder.DropForeignKey(
                name: "FK_CategoryLimits_Users_UserId",
                table: "CategoryLimits");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Categories_CategoryId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Users_UserId",
                table: "Transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Transactions",
                table: "Transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Categories",
                table: "Categories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CategoryLimits",
                table: "CategoryLimits");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BudgetConfigs",
                table: "BudgetConfigs");

            migrationBuilder.EnsureSchema(
                name: "finance");

            migrationBuilder.EnsureSchema(
                name: "parameters");

            migrationBuilder.EnsureSchema(
                name: "authentications");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "users",
                newSchema: "authentications");

            migrationBuilder.RenameTable(
                name: "Transactions",
                newName: "transactions",
                newSchema: "finance");

            migrationBuilder.RenameTable(
                name: "Categories",
                newName: "categories",
                newSchema: "parameters");

            migrationBuilder.RenameTable(
                name: "CategoryLimits",
                newName: "categoryLimit",
                newSchema: "finance");

            migrationBuilder.RenameTable(
                name: "BudgetConfigs",
                newName: "budgetConfig",
                newSchema: "finance");

            migrationBuilder.RenameIndex(
                name: "IX_Users_Email",
                schema: "authentications",
                table: "users",
                newName: "IX_users_Email");

            migrationBuilder.RenameIndex(
                name: "IX_Transactions_UserId",
                schema: "finance",
                table: "transactions",
                newName: "IX_transactions_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Transactions_CategoryId",
                schema: "finance",
                table: "transactions",
                newName: "IX_transactions_CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_Categories_UserId",
                schema: "parameters",
                table: "categories",
                newName: "IX_categories_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_CategoryLimits_UserId_CategoryId",
                schema: "finance",
                table: "categoryLimit",
                newName: "IX_categoryLimit_UserId_CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_CategoryLimits_CategoryId",
                schema: "finance",
                table: "categoryLimit",
                newName: "IX_categoryLimit_CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_BudgetConfigs_UserId",
                schema: "finance",
                table: "budgetConfig",
                newName: "IX_budgetConfig_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_users",
                schema: "authentications",
                table: "users",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_transactions",
                schema: "finance",
                table: "transactions",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_categories",
                schema: "parameters",
                table: "categories",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_categoryLimit",
                schema: "finance",
                table: "categoryLimit",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_budgetConfig",
                schema: "finance",
                table: "budgetConfig",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_budgetConfig_users_UserId",
                schema: "finance",
                table: "budgetConfig",
                column: "UserId",
                principalSchema: "authentications",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_categories_users_UserId",
                schema: "parameters",
                table: "categories",
                column: "UserId",
                principalSchema: "authentications",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_categoryLimit_categories_CategoryId",
                schema: "finance",
                table: "categoryLimit",
                column: "CategoryId",
                principalSchema: "parameters",
                principalTable: "categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_categoryLimit_users_UserId",
                schema: "finance",
                table: "categoryLimit",
                column: "UserId",
                principalSchema: "authentications",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_transactions_categories_CategoryId",
                schema: "finance",
                table: "transactions",
                column: "CategoryId",
                principalSchema: "parameters",
                principalTable: "categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_transactions_users_UserId",
                schema: "finance",
                table: "transactions",
                column: "UserId",
                principalSchema: "authentications",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_budgetConfig_users_UserId",
                schema: "finance",
                table: "budgetConfig");

            migrationBuilder.DropForeignKey(
                name: "FK_categories_users_UserId",
                schema: "parameters",
                table: "categories");

            migrationBuilder.DropForeignKey(
                name: "FK_categoryLimit_categories_CategoryId",
                schema: "finance",
                table: "categoryLimit");

            migrationBuilder.DropForeignKey(
                name: "FK_categoryLimit_users_UserId",
                schema: "finance",
                table: "categoryLimit");

            migrationBuilder.DropForeignKey(
                name: "FK_transactions_categories_CategoryId",
                schema: "finance",
                table: "transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_transactions_users_UserId",
                schema: "finance",
                table: "transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_users",
                schema: "authentications",
                table: "users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_transactions",
                schema: "finance",
                table: "transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_categories",
                schema: "parameters",
                table: "categories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_categoryLimit",
                schema: "finance",
                table: "categoryLimit");

            migrationBuilder.DropPrimaryKey(
                name: "PK_budgetConfig",
                schema: "finance",
                table: "budgetConfig");

            migrationBuilder.RenameTable(
                name: "users",
                schema: "authentications",
                newName: "Users");

            migrationBuilder.RenameTable(
                name: "transactions",
                schema: "finance",
                newName: "Transactions");

            migrationBuilder.RenameTable(
                name: "categories",
                schema: "parameters",
                newName: "Categories");

            migrationBuilder.RenameTable(
                name: "categoryLimit",
                schema: "finance",
                newName: "CategoryLimits");

            migrationBuilder.RenameTable(
                name: "budgetConfig",
                schema: "finance",
                newName: "BudgetConfigs");

            migrationBuilder.RenameIndex(
                name: "IX_users_Email",
                table: "Users",
                newName: "IX_Users_Email");

            migrationBuilder.RenameIndex(
                name: "IX_transactions_UserId",
                table: "Transactions",
                newName: "IX_Transactions_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_transactions_CategoryId",
                table: "Transactions",
                newName: "IX_Transactions_CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_categories_UserId",
                table: "Categories",
                newName: "IX_Categories_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_categoryLimit_UserId_CategoryId",
                table: "CategoryLimits",
                newName: "IX_CategoryLimits_UserId_CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_categoryLimit_CategoryId",
                table: "CategoryLimits",
                newName: "IX_CategoryLimits_CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_budgetConfig_UserId",
                table: "BudgetConfigs",
                newName: "IX_BudgetConfigs_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Transactions",
                table: "Transactions",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Categories",
                table: "Categories",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CategoryLimits",
                table: "CategoryLimits",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_BudgetConfigs",
                table: "BudgetConfigs",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BudgetConfigs_Users_UserId",
                table: "BudgetConfigs",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Users_UserId",
                table: "Categories",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CategoryLimits_Categories_CategoryId",
                table: "CategoryLimits",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CategoryLimits_Users_UserId",
                table: "CategoryLimits",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Categories_CategoryId",
                table: "Transactions",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Users_UserId",
                table: "Transactions",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
