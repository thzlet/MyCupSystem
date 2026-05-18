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
public class ListaJogosController : ControllerBase
{
    private readonly DiarioCopaContext _context;

    public ListaJogosController(DiarioCopaContext context)
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
    [HttpGet("listar-listas")]
    [Authorize]
    public IActionResult ListarListaJogos()
    {
        var idUsuarioLogado = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var minhasListas = _context.ListasJogos
            .Where(l => l.IdUsuario == idUsuarioLogado)
            .Select(l => new ListaJogosRespostaDto
            {
                IdListaJogos = l.IdLista,
                Titulo = l.TituloLista,
                Descricao = l.Descricao,
                Jogos = l.Jogos.ToList(),
                QuantidadeJogos = l.Jogos.Count
            })
            .ToList();

        return Ok(minhasListas);
    }
    [HttpGet("{idLista}")]
    [Authorize]
    public IActionResult BuscarLista(Guid idLista)
    {
        var idUsuarioLogado = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var lista = _context.ListasJogos
            .Where(l => l.IdLista == idLista && l.IdUsuario == idUsuarioLogado)
            .Select(l => new ListaJogosRespostaDto
            {
                IdListaJogos = l.IdLista,
                Titulo = l.TituloLista,
                Descricao = l.Descricao,
                Jogos = l.Jogos.ToList(),
                QuantidadeJogos = l.Jogos.Count
            })
            .FirstOrDefault();

        if (lista == null) return NotFound();
        
        return Ok(lista);
    }
    [HttpDelete("{idLista}")]
    [Authorize]
    public IActionResult DeletarLista(Guid idLista)
    {
        var idUsuarioLogado = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var lista = _context.ListasJogos
            .FirstOrDefault(l => l.IdLista == idLista && l.IdUsuario == idUsuarioLogado);

        if (lista == null) return NotFound(new { mensagem = "Lista não encontrada." });

        _context.ListasJogos.Remove(lista);
        _context.SaveChanges();

        return Ok(new { mensagem = "Lista deletada com sucesso!" });      
    }
    [HttpDelete("{idLista}/jogos{idJogo}")]
    [Authorize]
    public IActionResult RemoverJogo(Guid idLista, Guid idJogo)
    {
        var idUsuarioLogado = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var lista = _context.ListasJogos
            .Include(l => l.Jogos)
            .FirstOrDefault(l => l.IdLista == idLista && l.IdUsuario == idUsuarioLogado);

        if (lista == null) return NotFound(new { mensagem = "Lista não encontrada." });

        var jogo = lista.Jogos.FirstOrDefault(j => j.Id == idJogo);

        if (jogo == null) return NotFound(new { mensagem = "Jogo não encontrado na lista." });

        lista.Jogos.Remove(jogo);
        _context.SaveChanges();

        return Ok(new { mensagem = "Jogo removido da lista com sucesso!" });     
    }
}