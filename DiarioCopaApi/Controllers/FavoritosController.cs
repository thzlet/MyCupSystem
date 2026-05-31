using DiarioCopaApi.Data;
using DiarioCopaApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DiarioCopaApi.Controllers;

[ApiController]
[Route("api/favoritos")]
[Authorize]
public class FavoritosController : ControllerBase
{
    private readonly DiarioCopaContext _context;
    public FavoritosController(DiarioCopaContext context) => _context = context;

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET /api/favoritos
    [HttpGet]
    public async Task<IActionResult> GetFavoritos()
    {
        var userId = GetUserId();
        var favoritos = await _context.JogosFavoritos
            .Where(f => f.IdUsuario == userId)
            .Include(f => f.Jogo)
            .Select(f => new
            {
                f.IdJogo,
                JogoTitulo  = $"{f.Jogo.Time1} x {f.Jogo.Time2}",
                f.Jogo.DataHora,
                f.Jogo.Fase,
                f.Jogo.GolsTime1,
                f.Jogo.GolsTime2,
                f.DataCriacao
            })
            .OrderByDescending(f => f.DataCriacao)
            .ToListAsync();

        return Ok(favoritos);
    }

    // POST /api/favoritos/{jogoId}
    [HttpPost("{jogoId:guid}")]
    public async Task<IActionResult> Favoritar(Guid jogoId)
    {
        var userId = GetUserId();

        if (await _context.JogosFavoritos.AnyAsync(f => f.IdUsuario == userId && f.IdJogo == jogoId))
            return Conflict(new { mensagem = "Jogo já está nos favoritos." });

        if (!await _context.Jogos.AnyAsync(j => j.Id == jogoId))
            return NotFound(new { mensagem = "Jogo não encontrado." });

        _context.JogosFavoritos.Add(new JogoFavorito
        {
            IdUsuario = userId,
            IdJogo    = jogoId
        });

        await _context.SaveChangesAsync();
        return Ok(new { mensagem = "Jogo adicionado aos favoritos." });
    }

    // DELETE /api/favoritos/{jogoId}
    [HttpDelete("{jogoId:guid}")]
    public async Task<IActionResult> Desfavoritar(Guid jogoId)
    {
        var userId = GetUserId();
        var fav = await _context.JogosFavoritos
            .FirstOrDefaultAsync(f => f.IdUsuario == userId && f.IdJogo == jogoId);

        if (fav == null) return NotFound(new { mensagem = "Jogo não está nos favoritos." });

        _context.JogosFavoritos.Remove(fav);
        await _context.SaveChangesAsync();
        return Ok(new { mensagem = "Jogo removido dos favoritos." });
    }
}