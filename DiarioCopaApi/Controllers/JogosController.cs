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

public class JogosController : ControllerBase
{
    private readonly DiarioCopaContext _context;
    public JogosController(DiarioCopaContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult ListarJogos()
    {
        var jogos = _context.Jogos.OrderBy(j=>j.DataHora).Select(j => new JogoRespostaDto
        {
            Id = j.Id,
            Time1 = j.Time1,
            Time2 = j.Time2,
            DataHora = j.DataHora,
            Estadio = j.Estadio,
            Fase = j.Fase,
            GolsTime1 = j.GolsTime1,
            GolsTime2 = j.GolsTime2
        })
        .ToList();

        return Ok(jogos);
    }
}