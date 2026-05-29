using DiarioCopaApi.Models;

namespace DiarioCopaApi.DTOs;

public class JogoRespostaDto
{
    public Guid Id { get; set; }
    public string Time1 { get; set; } = string.Empty;
    public string Time2 { get; set; } = string.Empty;
    public DateTime DataHora { get; set; }
    public string Estadio { get; set; } = string.Empty;
    public string Fase { get; set; } = string.Empty;
    public int? GolsTime1 { get; set; }
    public int? GolsTime2 { get; set; }
}