using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DiarioCopaApi.Models;

public class JogoFavorito
{
    public Guid IdJogo { get; set; }

    public Guid IdUsuario { get; set; }

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    [ForeignKey("IdJogo")]
    public Jogo Jogo { get; set; } = null!;

    [ForeignKey("IdUsuario")]
    public Usuario Usuario { get; set; } = null!;
}