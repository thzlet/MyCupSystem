using System.ComponentModel.DataAnnotations;

namespace DiarioCopaApi.DTOs;
public class CriarContaDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    [MinLength(8)]
    public string Senha { get; set; } = "";

    [Required]
    public string Nome { get; set; } = "";
}