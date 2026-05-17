using DiarioCopaApi.Models;

namespace DiarioCopaApi.DTOs;

public class ListaJogosRespostaDto
{
    public Guid IdListaJogos { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public List<Jogo> Jogos { get; set; } = new List<Jogo>();
    public int QuantidadeJogos { get; set; }
}