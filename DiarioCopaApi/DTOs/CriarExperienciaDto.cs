using System.ComponentModel.DataAnnotations;
using DiarioCopaApi.Models;

namespace DiarioCopaApi.DTOs;

public class CriarExperienciaDto
{
    [Required(ErrorMessage = "O Jogo é obrigatório.")]
    public Guid IdJogo { get; set; }

    public Nota? Nota { get; set; }

    public Sentimento? Sentimento { get; set; }

    [MaxLength(500, ErrorMessage = "O comentário não pode passar de 500 caracteres.")]
    public string? Comentario { get; set; }

    [MaxLength(200)]
    public string? Localizacao { get; set; }

    public string? URL_Imagem { get; set; }
    public bool Assistido { get; set; }
    public bool Favorito { get; set; }
}