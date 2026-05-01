using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace DiarioCopaApi.Models;


public class Experiencia
{
    [Key]
    public Guid IdExperiencia { get; set; } = Guid.NewGuid();

    [Required]
    public Guid IdUsuario { get; set; }

    [Required]
    public Guid IdJogo { get; set; }

    [MaxLength(500)]
    public string? Comentario { get; set; } = string.Empty;

    //IMAGEM AINDA VOU VER COMO FAZ ISSO
    public string? URL_Imagem { get; set; } = string.Empty;

    public Nota Nota { get; set; }

    public Sentimento Sentimento { get; set; }

    [MaxLength(200)]
    public string? Localizacao { get; set; } = string.Empty;

    public DateTime DataCriacao { get; set;} = DateTime.UtcNow;

    [ForeignKey("IdUsuario")]
    public Usuario Usuario { get; set; } = null!;

    [ForeignKey("IdJogo")]
    public Jogo Jogo { get; set; } = null!;

}