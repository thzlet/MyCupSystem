using System.ComponentModel.DataAnnotations;

namespace DiarioCopaApi.DTOs;

public class CriarListaDto
{
    [Required(ErrorMessage = "O título da lista é obrigatório.")]
    [MaxLength(50, ErrorMessage = "O título não pode passar de 50 caracteres.")]
    public string TituloLista { get; set; } = string.Empty;

    [Required(ErrorMessage = "A descrição é obrigatória.")]
    [MaxLength(200, ErrorMessage = "A descrição não pode passar de 200 caracteres.")]
    public string Descricao { get; set; } = string.Empty;
}