using System.ComponentModel.DataAnnotations;
namespace DiarioCopaApi.DTOs;

public class CriarListaDto
{
    [Required(ErrorMessage = "O título da lista é obrigatório.")]
    [MaxLength(100, ErrorMessage = "O título deve ter no máximo 100 caracteres.")]
    public string TituloLista { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "A descrição deve ter no máximo 500 caracteres.")]
    public string? Descricao { get; set; }

    public List<Guid>? IdJogos { get; set; }
}