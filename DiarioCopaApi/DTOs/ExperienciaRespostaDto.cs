using DiarioCopaApi.Models;

namespace DiarioCopaApi.DTOs;

public class ExperienciaRespostaDto
{
    public Guid IdExperiencia { get; set; }

    public Guid     IdJogo     { get; set; }
    public string   JogoTitulo { get; set; } = string.Empty;
    public DateTime DataJogo   { get; set; }
    public string   Fase       { get; set; } = string.Empty;
    public int?     GolsTime1  { get; set; }
    public int?     GolsTime2  { get; set; }

    public Nota?       Nota        { get; set; }
    public Sentimento? Sentimento  { get; set; }
    public string?     Comentario  { get; set; }
    public string?     Localizacao { get; set; }
    public DateTime    DataRegistro { get; set; }

    public bool    Assistido  { get; set; }
    public bool    Favorito   { get; set; }
    public string? UrlImagem  { get; set; }   // ← campo adicionado
}