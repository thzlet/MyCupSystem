using System.Security.Claims;
using DiarioCopaApi.Data;
using DiarioCopaApi.Models;
using DiarioCopaApi.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiarioCopaApi.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ExperienciasController : ControllerBase
{
    private readonly DiarioCopaContext _context;

    public ExperienciasController(DiarioCopaContext context)
    {
        _context = context;
    }

    [HttpPost("criar-experiencia")]
    public IActionResult RegistrarExperiencia([FromBody] CriarExperienciaDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (idClaim == null)
            return Unauthorized(new { mensagem = "Usuário não autenticado." });

        var idUsuarioLogado = Guid.Parse(idClaim.Value);

        var jogoExiste = _context.Jogos.Any(j => j.Id == dto.IdJogo);
        if (!jogoExiste)
            return NotFound(new { mensagem = "O jogo informado não foi encontrado." });

        var jaAvaliou = _context.Experiencias.Any(e => e.IdUsuario == idUsuarioLogado && e.IdJogo == dto.IdJogo);
        if (jaAvaliou)
            return Conflict(new { mensagem = "Você já registrou uma experiência para este jogo." });

        var novaExperiencia = new Experiencia
        {
            IdUsuario   = idUsuarioLogado,
            IdJogo      = dto.IdJogo,
            Nota        = dto.Nota,
            Sentimento  = dto.Sentimento,
            Comentario  = dto.Comentario,
            Localizacao = dto.Localizacao,
            Assistido   = dto.Assistido,
            Favorito    = dto.Favorito,
            URL_Imagem  = dto.URL_Imagem
        };

        _context.Experiencias.Add(novaExperiencia);
        _context.SaveChanges();

        return Ok(new { mensagem = "Experiência registrada no seu diário com sucesso!", id = novaExperiencia.IdExperiencia });
    }

    [HttpGet("listar-experiencias")]
    public IActionResult ListarExperiencias()
    {
        var idUsuarioLogado = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var minhasExperiencias = _context.Experiencias
            .Include(e => e.Jogo)
            .Where(e => e.IdUsuario == idUsuarioLogado)
            .OrderByDescending(e => e.DataCriacao)
            .Select(e => new ExperienciaRespostaDto
            {
                IdExperiencia = e.IdExperiencia,
                IdJogo        = e.IdJogo,
                JogoTitulo    = $"{e.Jogo!.Time1} x {e.Jogo!.Time2}",
                DataJogo      = e.Jogo.DataHora,
                Fase          = e.Jogo.Fase,
                GolsTime1     = e.Jogo.GolsTime1,
                GolsTime2     = e.Jogo.GolsTime2,
                Nota          = e.Nota,
                Sentimento    = e.Sentimento,
                Comentario    = e.Comentario,
                Localizacao   = e.Localizacao,
                DataRegistro  = e.DataCriacao,
                Assistido     = e.Assistido,
                Favorito      = e.Favorito
            })
            .ToList();

        return Ok(minhasExperiencias);
    }

    [HttpPut("{idExperiencia}")]
    public IActionResult EditarExperiencia(Guid idExperiencia, [FromBody] EditarExperienciaDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var idUsuarioLogado = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var experiencia = _context.Experiencias
            .FirstOrDefault(e => e.IdExperiencia == idExperiencia && e.IdUsuario == idUsuarioLogado);

        if (experiencia == null)
            return NotFound(new { mensagem = "Experiência não encontrada ou você não tem permissão para editá-la." });

        experiencia.Nota        = dto.Nota;
        experiencia.Sentimento  = dto.Sentimento;
        experiencia.Comentario  = dto.Comentario;
        experiencia.Localizacao = dto.Localizacao;

        if (dto.URL_Imagem != null)
            experiencia.URL_Imagem = dto.URL_Imagem;

        _context.Experiencias.Update(experiencia);
        _context.SaveChanges();

        return Ok(new { mensagem = "Sua experiência foi atualizada com sucesso!" });
    }

    [HttpDelete("{idExperiencia}")]
    public IActionResult ApagarExperiencia(Guid idExperiencia)
    {
        var idUsuarioLogado = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var experiencia = _context.Experiencias
            .FirstOrDefault(e => e.IdExperiencia == idExperiencia && e.IdUsuario == idUsuarioLogado);

        if (experiencia == null)
            return NotFound(new { mensagem = "Experiência não encontrada ou você não tem permissão para apagá-la." });

        _context.Experiencias.Remove(experiencia);
        _context.SaveChanges();

        return Ok(new { mensagem = "Experiência apagada com sucesso do seu diário." });
    }
}