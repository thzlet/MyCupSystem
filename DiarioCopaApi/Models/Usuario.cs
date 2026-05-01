using System.ComponentModel.DataAnnotations;

namespace DiarioCopaApi.Models;

public class Usuario
{
    [Key]
    public Guid IdUsuario { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string HashSenha { get; set; } = string.Empty;


    // Relacionamentos, esse ICollection é como se fosse um List só que mais leve e o EF prefere que use ele e é melhor de fazer buscas
    public ICollection<Experiencia> Experiencias { get; set; } = new List<Experiencia>();
    public ICollection<JogoFavorito> JogoFavorito { get; set; } = new List<JogoFavorito>();
    public ICollection<ListaJogos> ListaJogos { get; set; } = new List<ListaJogos>();
}