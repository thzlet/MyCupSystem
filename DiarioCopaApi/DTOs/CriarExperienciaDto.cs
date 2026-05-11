using System.ComponentModel.DataAnnotations;
using DiarioCopaApi.Models;

namespace DiarioCopaApi.DTOs;

public class CriarExperienciaDto
{
    [Required(ErrorMessage = "O Jogo é obrigatório.")]
    public Guid IdJogo { get; set; }

    [Required(ErrorMessage = "A nota é obrigatória.")]
    public Nota Nota { get; set; }

    [Required(ErrorMessage = "O sentimento é obrigatório.")]
    public Sentimento Sentimento { get; set; }

    [MaxLength(500, ErrorMessage = "O comentário não pode passar de 500 caracteres.")]
    public string? Comentario { get; set; }

    [MaxLength(200)]
    public string? Localizacao { get; set; }

    // depois ver como funciona esse negocio da imagem
    public string? URL_Imagem { get; set; }
}