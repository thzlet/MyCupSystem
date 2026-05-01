using DiarioCopaApi.Models;
using Microsoft.EntityFrameworkCore;

namespace DiarioCopaApi.Data;

public class DiarioCopaContext : DbContext
{
    public DiarioCopaContext(DbContextOptions<DiarioCopaContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Experiencia> Experiencias { get; set; }
    public DbSet<Jogo> Jogos { get; set; }
    public DbSet<JogoFavorito> JogosFavoritos { get; set; }
    public DbSet<ListaJogos> ListasJogos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<JogoFavorito>()
            .HasKey(jf => new { jf.IdUsuario, jf.IdJogo });
    }
}