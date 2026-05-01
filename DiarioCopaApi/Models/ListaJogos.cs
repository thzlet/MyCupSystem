using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DiarioCopaApi.Models;

public class ListaJogos
{
    [Key]
    public Guid IdLista { get; set; } = Guid.NewGuid();

    [Required]
    public Guid IdUsuario { get; set; }

    [Required]
    [MaxLength(50)]
    public string TituloLista { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Descricao { get; set; } = string.Empty;

    public List<Jogo> Jogos { get; set;} = new List<Jogo>();

    [ForeignKey("IdUsuario")]
    public Usuario Usuario { get; set; } = null!;
}