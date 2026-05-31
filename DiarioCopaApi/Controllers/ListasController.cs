using DiarioCopaApi.Data;
using DiarioCopaApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DiarioCopaApi.DTOs;

namespace DiarioCopaApi.Controllers;

[ApiController]
[Route("api/listas")]
[Authorize]
public class ListasController : ControllerBase
{
    private readonly DiarioCopaContext _context;
    public ListasController(DiarioCopaContext context) => _context = context;

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET /api/listas
    [HttpGet]
    public async Task<IActionResult> GetListas()
    {
        var userId = GetUserId();
        var listas = await _context.ListasJogos
            .Where(l => l.IdUsuario == userId)
            .Include(l => l.Jogos)
            .Select(l => new
            {
                l.IdLista,
                l.TituloLista,
                l.Descricao,
                QuantidadeJogos = l.Jogos.Count,
                Jogos = l.Jogos.Select(j => new
                {
                    j.Id, j.Time1, j.Time2, j.DataHora, j.Fase,
                    j.Estadio, j.GolsTime1, j.GolsTime2
                })
            })
            .ToListAsync();

        return Ok(listas);
    }

    // GET /api/listas/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetLista(Guid id)
    {
        var userId = GetUserId();
        var lista = await _context.ListasJogos
            .Where(l => l.IdLista == id && l.IdUsuario == userId)
            .Include(l => l.Jogos)
            .Select(l => new
            {
                l.IdLista,
                l.TituloLista,
                l.Descricao,
                Jogos = l.Jogos.Select(j => new
                {
                    j.Id, j.Time1, j.Time2, j.DataHora, j.Fase,
                    j.Estadio, j.GolsTime1, j.GolsTime2
                })
            })
            .FirstOrDefaultAsync();

        if (lista == null) return NotFound(new { mensagem = "Lista não encontrada." });
        return Ok(lista);
    }

    // POST /api/listas
    [HttpPost]
    public async Task<IActionResult> CriarLista([FromBody] CriarListaJogosDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.TituloLista))
            return BadRequest(new { mensagem = "O título da lista é obrigatório." });

        var lista = new ListaJogos
        {
            IdUsuario   = GetUserId(),
            TituloLista = dto.TituloLista.Trim(),
            Descricao   = (dto.Descricao ?? "").Trim()
        };

        _context.ListasJogos.Add(lista);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            lista.IdLista,
            lista.TituloLista,
            lista.Descricao,
            QuantidadeJogos = 0
        });
    }

    // POST /api/listas/{id}/jogos/{jogoId}
    [HttpPost("{id:guid}/jogos/{jogoId:guid}")]
    public async Task<IActionResult> AdicionarJogo(Guid id, Guid jogoId)
    {
        var userId = GetUserId();
        var lista = await _context.ListasJogos
            .Include(l => l.Jogos)
            .FirstOrDefaultAsync(l => l.IdLista == id && l.IdUsuario == userId);

        if (lista == null) return NotFound(new { mensagem = "Lista não encontrada." });

        if (lista.Jogos.Any(j => j.Id == jogoId))
            return Conflict(new { mensagem = "Jogo já está nessa lista." });

        var jogo = await _context.Jogos.FindAsync(jogoId);
        if (jogo == null) return NotFound(new { mensagem = "Jogo não encontrado." });

        lista.Jogos.Add(jogo);
        await _context.SaveChangesAsync();
        return Ok(new { mensagem = "Jogo adicionado à lista." });
    }

    // DELETE /api/listas/{id}/jogos/{jogoId}
    [HttpDelete("{id:guid}/jogos/{jogoId:guid}")]
    public async Task<IActionResult> RemoverJogo(Guid id, Guid jogoId)
    {
        var userId = GetUserId();
        var lista = await _context.ListasJogos
            .Include(l => l.Jogos)
            .FirstOrDefaultAsync(l => l.IdLista == id && l.IdUsuario == userId);

        if (lista == null) return NotFound(new { mensagem = "Lista não encontrada." });

        var jogo = lista.Jogos.FirstOrDefault(j => j.Id == jogoId);
        if (jogo == null) return NotFound(new { mensagem = "Jogo não está nessa lista." });

        lista.Jogos.Remove(jogo);
        await _context.SaveChangesAsync();
        return Ok(new { mensagem = "Jogo removido da lista." });
    }

    // DELETE /api/listas/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletarLista(Guid id)
    {
        var userId = GetUserId();
        var lista = await _context.ListasJogos
            .FirstOrDefaultAsync(l => l.IdLista == id && l.IdUsuario == userId);

        if (lista == null) return NotFound(new { mensagem = "Lista não encontrada." });

        _context.ListasJogos.Remove(lista);
        await _context.SaveChangesAsync();
        return Ok(new { mensagem = "Lista deletada." });
    }
}