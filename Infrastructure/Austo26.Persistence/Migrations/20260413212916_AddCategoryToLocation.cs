using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Austo26.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryToLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "Locations",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Locations_CategoryId",
                table: "Locations",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Locations_Categories_CategoryId",
                table: "Locations",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Locations_Categories_CategoryId",
                table: "Locations");

            migrationBuilder.DropIndex(
                name: "IX_Locations_CategoryId",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Locations");
        }
    }
}
