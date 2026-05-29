using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DiarioCopaApi.Migrations
{
    /// <inheritdoc />
    public partial class FavoritosAssistidos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Assistido",
                table: "Experiencias",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Favorito",
                table: "Experiencias",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Assistido",
                table: "Experiencias");

            migrationBuilder.DropColumn(
                name: "Favorito",
                table: "Experiencias");
        }
    }
}
