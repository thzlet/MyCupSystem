using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace DiarioCopaApi.DTOs;
public class CriarContaDto
{
    [Required]
    [EmailAddress(ErrorMessage = "Formato de e-mail inválido.")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8, ErrorMessage = "Tamanho de senha inválido.")]
    [JsonPropertyName("password")]
    public string Senha { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("name")]
    public string Nome { get; set; } = string.Empty;
}