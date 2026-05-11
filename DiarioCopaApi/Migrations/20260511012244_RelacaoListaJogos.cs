using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DiarioCopaApi.Migrations
{
    /// <inheritdoc />
    public partial class RelacaoListaJogos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Jogos_ListasJogos_ListaJogosIdLista",
                table: "Jogos");

            migrationBuilder.DropIndex(
                name: "IX_Jogos_ListaJogosIdLista",
                table: "Jogos");

            migrationBuilder.DropColumn(
                name: "ListaJogosIdLista",
                table: "Jogos");

            migrationBuilder.CreateTable(
                name: "ListaJogosJogos",
                columns: table => new
                {
                    JogosId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ListaJogosIdLista = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListaJogosJogos", x => new { x.JogosId, x.ListaJogosIdLista });
                    table.ForeignKey(
                        name: "FK_ListaJogosJogos_Jogos_JogosId",
                        column: x => x.JogosId,
                        principalTable: "Jogos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListaJogosJogos_ListasJogos_ListaJogosIdLista",
                        column: x => x.ListaJogosIdLista,
                        principalTable: "ListasJogos",
                        principalColumn: "IdLista",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ListaJogosJogos_ListaJogosIdLista",
                table: "ListaJogosJogos",
                column: "ListaJogosIdLista");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ListaJogosJogos");

            migrationBuilder.AddColumn<Guid>(
                name: "ListaJogosIdLista",
                table: "Jogos",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");

            migrationBuilder.CreateIndex(
                name: "IX_Jogos_ListaJogosIdLista",
                table: "Jogos",
                column: "ListaJogosIdLista");

            migrationBuilder.AddForeignKey(
                name: "FK_Jogos_ListasJogos_ListaJogosIdLista",
                table: "Jogos",
                column: "ListaJogosIdLista",
                principalTable: "ListasJogos",
                principalColumn: "IdLista");
        }
    }
}
