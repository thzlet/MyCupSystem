using System.ComponentModel.DataAnnotations;

namespace DiarioCopaApi.Models;

public class Jogo
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(50)]
    public string Time1 { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Time2 { set; get; } = string.Empty;

    [Required]
    public DateTime DataHora { get; set; }

    [Required]
    [MaxLength(100)]
    public string Estadio { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Fase { get; set; } = string.Empty;

    public int? GolsTime1 { get; set; }
    
    public int? GolsTime2 { get; set; }
}