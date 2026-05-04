using System.ComponentModel.DataAnnotations;

namespace DiarioCopaApi.DTOs;

public class AlterarSenhaDto
{
    [Required(ErrorMessage = "A senha atual é obrigatória.")]
    public string SenhaAtual { get; set; } = string.Empty;

    [Required(ErrorMessage = "A nova senha é obrigatória")]
    [MinLength(8, ErrorMessage = "Tamanho de senha inválido.")]
    public string NovaSenha { get; set; } = String.Empty;

    [Required(ErrorMessage = "A confirmação de senha é obrigatória.")]
    [Compare("NovaSenha", ErrorMessage = "As senhas não conferem.")]
    public string ConfirmarNovaSenha { get; set; } = string.Empty;

}