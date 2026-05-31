using DiarioCopaApi.Models;

namespace DiarioCopaApi.DTOs;

public class ExperienciaRespostaDto
{
    public Guid IdExperiencia { get; set; }

    // Dados do Jogo para o Front-end
    public Guid IdJogo { get; set; }
    public string JogoTitulo { get; set; } = string.Empty; // Ex: "Brasil x Suíça"
    public DateTime DataJogo { get; set; }
    public string Fase { get; set; } = string.Empty;
    public int? GolsTime1 { get; set; }
    public int? GolsTime2 { get; set; }

    // Dados da Avaliação
    public Nota Nota { get; set; }
    public Sentimento Sentimento { get; set; }
    public string? Comentario { get; set; }
    public string? Localizacao { get; set; }
    public DateTime DataRegistro { get; set; }

    // Flags de interação
    public bool Assistido { get; set; }
    public bool Favorito { get; set; }
}