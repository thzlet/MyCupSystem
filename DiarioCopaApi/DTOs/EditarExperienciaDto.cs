using System.ComponentModel.DataAnnotations;
using DiarioCopaApi.Models;

namespace DiarioCopaApi.DTOs;

public class EditarExperienciaDto
{
    public Nota? Nota { get; set; }

    public Sentimento? Sentimento { get; set; }

    [MaxLength(500, ErrorMessage = "O comentário não pode passar de 500 caracteres.")]
    public string? Comentario { get; set; }

    [MaxLength(200)]
    public string? Localizacao { get; set; }

    public string? URL_Imagem { get; set; }
}