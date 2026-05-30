using System.Security.Claims;
using DiarioCopaApi.Data;
using DiarioCopaApi.Models;
using DiarioCopaApi.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiarioCopaApi.Controllers;

// ================================================================
//  RF13 – Criar Lista de Jogos
// ================================================================

[Route("api/listas")]
[ApiController]
[Authorize]
public class ListasController : ControllerBase
{
    private readonly DiarioCopaContext _context;

    public ListasController(DiarioCopaContext context)
    {
        _context = context;
    }

    // POST /api/listas
    [HttpPost]
    public IActionResult CriarLista([FromBody] CriarListaDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var idUsuarioLogado = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var novaLista = new ListaJogos
        {
            IdUsuario   = idUsuarioLogado,
            TituloLista = dto.TituloLista,
            Descricao   = dto.Descricao
        };

        _context.ListasJogos.Add(novaLista);
        _context.SaveChanges();

        return Ok(new
        {
            mensagem    = "Lista criada com sucesso!",
            idLista     = novaLista.IdLista,
            tituloLista = novaLista.TituloLista,
            descricao   = novaLista.Descricao
        });
    }

    // GET /api/listas
    [HttpGet]
    public IActionResult ListarListas()
    {
        var idUsuarioLogado = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var listas = _context.ListasJogos
            .Include(l => l.Jogos)
            .Where(l => l.IdUsuario == idUsuarioLogado)
            .Select(l => new
            {
                l.IdLista,
                l.TituloLista,
                l.Descricao,
                QuantidadeJogos = l.Jogos.Count
            })
            .ToList();

        return Ok(listas);
    }
}

// ================================================================
//  RF14 – Adicionar / Remover Jogo como Favorito
// ================================================================

[Route("api/favoritos")]
[ApiController]
[Authorize]
public class FavoritosController : ControllerBase
{
    private readonly DiarioCopaContext _context;

    public FavoritosController(DiarioCopaContext context)
    {
        _context = context;
    }

    // POST /api/favoritos/{idJogo}
    [HttpPost("{idJogo}")]
    public IActionResult Favoritar(Guid idJogo)
    {
        var idUsuarioLogado = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var jogoExiste = _context.Jogos.Any(j => j.Id == idJogo);
        if (!jogoExiste)
            return NotFound(new { mensagem = "Jogo não encontrado." });

        var jaFavoritou = _context.JogosFavoritos
            .Any(jf => jf.IdUsuario == idUsuarioLogado && jf.IdJogo == idJogo);
        if (jaFavoritou)
            return Conflict(new { mensagem = "Este jogo já está nos seus favoritos." });

        var favorito = new JogoFavorito
        {
            IdUsuario = idUsuarioLogado,
            IdJogo    = idJogo
        };

        _context.JogosFavoritos.Add(favorito);
        _context.SaveChanges();

        return Ok(new { mensagem = "Jogo adicionado aos favoritos!" });
    }

    // DELETE /api/favoritos/{idJogo}
    [HttpDelete("{idJogo}")]
    public IActionResult Desfavoritar(Guid idJogo)
    {
        var idUsuarioLogado = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var favorito = _context.JogosFavoritos
            .FirstOrDefault(jf => jf.IdUsuario == idUsuarioLogado && jf.IdJogo == idJogo);

        if (favorito == null)
            return NotFound(new { mensagem = "Este jogo não está nos seus favoritos." });

        _context.JogosFavoritos.Remove(favorito);
        _context.SaveChanges();

        return Ok(new { mensagem = "Jogo removido dos favoritos." });
    }

    // GET /api/favoritos
    [HttpGet]
    public IActionResult ListarFavoritos()
    {
        var idUsuarioLogado = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var favoritos = _context.JogosFavoritos
            .Include(jf => jf.Jogo)
            .Where(jf => jf.IdUsuario == idUsuarioLogado)
            .OrderByDescending(jf => jf.DataCriacao)
            .Select(jf => new
            {
                jf.IdJogo,
                JogoTitulo = $"{jf.Jogo.Time1} x {jf.Jogo.Time2}",
                jf.Jogo.DataHora,
                jf.Jogo.Fase,
                jf.Jogo.GolsTime1,
                jf.Jogo.GolsTime2,
                jf.DataCriacao
            })
            .ToList();

        return Ok(favoritos);
    }
}