using DiarioCopaApi.Data;
using DiarioCopaApi.Models;
using DiarioCopaApi.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace DiarioCopaApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsuariosController : ControllerBase
{
    public readonly DiarioCopaContext _context;

    public UsuariosController(DiarioCopaContext context)
    {
        _context = context;
    }

    [HttpPost("criar")]
    public IActionResult CriarConta([FromBody] CriarContaDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (_context.Usuarios.Any(u => u.Email == dto.Email))
            return Conflict(new { mensagem = "Este e-mail já está cadastrado." });

        var novoUsuario = new Usuario
        {
            Nome = dto.Nome.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            HashSenha = BCrypt.Net.BCrypt.HashPassword(dto.Senha)
        };

        _context.Usuarios.Add(novoUsuario);
        _context.SaveChanges();

        return CreatedAtAction(nameof(CriarConta), new { id = novoUsuario.IdUsuario},
        new { mensagem = "Conta criada com sucesso!", id = novoUsuario.IdUsuario});
    }
}