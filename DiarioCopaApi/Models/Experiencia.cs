using System.ComponentModel.DataAnnotations;

namespace DiarioCopaApi.Models;

public class Experiencia
{
    [Key]
    public Guid IdExperiencia { get; set; } = Guid.NewGuid();
    public Guid IdUsuario     { get; set; }
    public Guid IdJogo        { get; set; }

    public Nota?       Nota        { get; set; }
    public Sentimento? Sentimento  { get; set; }

    public string? Comentario   { get; set; }
    public string? Localizacao  { get; set; }
    public string? URL_Imagem   { get; set; }

    public bool Assistido { get; set; }
    public bool Favorito  { get; set; }

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    public Usuario? Usuario { get; set; }
    public Jogo?    Jogo    { get; set; }
}