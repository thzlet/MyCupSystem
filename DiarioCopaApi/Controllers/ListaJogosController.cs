using DiarioCopaApi.Data;
using DiarioCopaApi.Models;
using DiarioCopaApi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DiarioCopaApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ListaJogosController : ControllerBase  // ← estava faltando isso
{
    private readonly DiarioCopaContext _context;    // ← e isso

    public ListaJogosController(DiarioCopaContext context)  // ← e o construtor
    {
        _context = context;
    }

    [HttpPost("criar")]
    [Authorize]
    public IActionResult CriarLista([FromBody] CriarListaDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var idUsuario = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var novaLista = new ListaJogos
        {
            TituloLista = dto.TituloLista.Trim(),
            Descricao = dto.Descricao?.Trim(),
            IdUsuario = idUsuario
        };

        if (dto.IdJogos != null && dto.IdJogos.Any())
        {
            var jogos = _context.Jogos
                .Where(j => dto.IdJogos.Contains(j.Id))
                .ToList();

            novaLista.Jogos = jogos;
        }

        _context.ListasJogos.Add(novaLista);
        _context.SaveChanges();

        return CreatedAtAction(nameof(CriarLista), new { id = novaLista.IdLista },
            new { mensagem = "Lista criada com sucesso!", id = novaLista.IdLista });
    }

    [HttpPost("{idLista}/jogos/{idJogo}")]
    [Authorize]
    public IActionResult AdicionarJogo(Guid idLista, Guid idJogo)
    {
        var idUsuario = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var lista = _context.ListasJogos
            .Include(l => l.Jogos)
            .FirstOrDefault(l => l.IdLista == idLista && l.IdUsuario == idUsuario);

        if (lista == null)
            return NotFound(new { mensagem = "Lista não encontrada." });

        var jogo = _context.Jogos.FirstOrDefault(j => j.Id == idJogo);

        if (jogo == null)
            return NotFound(new { mensagem = "Jogo não encontrado." });

        if (lista.Jogos.Any(j => j.Id == idJogo))
            return Conflict(new { mensagem = "Este jogo já está na lista." });

        lista.Jogos.Add(jogo);
        _context.SaveChanges();

        return Ok(new { mensagem = "Jogo adicionado com sucesso!" });
    }
}