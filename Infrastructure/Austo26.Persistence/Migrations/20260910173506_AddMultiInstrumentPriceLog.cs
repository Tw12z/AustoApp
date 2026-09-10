using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Austo26.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiInstrumentPriceLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AtaLiraTRY",
                table: "GoldPriceLogs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CeyrekAltinTRY",
                table: "GoldPriceLogs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CumhuriyetAltinTRY",
                table: "GoldPriceLogs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EurTRY",
                table: "GoldPriceLogs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "GbpTRY",
                table: "GoldPriceLogs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TamAltinTRY",
                table: "GoldPriceLogs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "UsdTRY",
                table: "GoldPriceLogs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "YarimAltinTRY",
                table: "GoldPriceLogs",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AtaLiraTRY",
                table: "GoldPriceLogs");

            migrationBuilder.DropColumn(
                name: "CeyrekAltinTRY",
                table: "GoldPriceLogs");

            migrationBuilder.DropColumn(
                name: "CumhuriyetAltinTRY",
                table: "GoldPriceLogs");

            migrationBuilder.DropColumn(
                name: "EurTRY",
                table: "GoldPriceLogs");

            migrationBuilder.DropColumn(
                name: "GbpTRY",
                table: "GoldPriceLogs");

            migrationBuilder.DropColumn(
                name: "TamAltinTRY",
                table: "GoldPriceLogs");

            migrationBuilder.DropColumn(
                name: "UsdTRY",
                table: "GoldPriceLogs");

            migrationBuilder.DropColumn(
                name: "YarimAltinTRY",
                table: "GoldPriceLogs");
        }
    }
}
