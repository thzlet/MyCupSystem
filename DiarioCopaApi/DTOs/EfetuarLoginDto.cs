using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace DiarioCopaApi.DTOs;

public class EfetuarLoginDto
{
    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "Formato de e-mail inválido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "A senha é obrigatória.")]
    [JsonPropertyName("password")]
    public string Senha { get; set; } = string.Empty;
}