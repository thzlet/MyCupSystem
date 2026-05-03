using DiarioCopaApi.Data;
using DiarioCopaApi.Models;
using DiarioCopaApi.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using DiarioCopaApi.Services;
using System.Reflection.Metadata;
using System.Security.Claims;

namespace DiarioCopaApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsuariosController : ControllerBase
{
    private readonly DiarioCopaContext _context;
    private readonly TokenService _tokenService;

    public UsuariosController(DiarioCopaContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
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

    [HttpPost("login")]
    public IActionResult EfetuarLogin([FromBody] EfetuarLoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var usuario = _context.Usuarios.FirstOrDefault(u => u.Email == dto.Email.Trim().ToLowerInvariant());

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.HashSenha))
            return Unauthorized(new { mensagem = "E-mail ou senha inválidos." });

        var tokenString = _tokenService.GerarToken(usuario);

        return Ok(new
        {
            mensagem = "Login realizado com sucesso!",
            token = tokenString,
            usuario = new { usuario.IdUsuario, usuario.Nome }
        });
    }

    [HttpPut("alterar-senha")]
    [Authorize] 
    public IActionResult AlterarSenha([FromBody] AlterarSenhaDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var idUsuario = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var usuario = _context.Usuarios.FirstOrDefault(u => u.IdUsuario == idUsuario);
        if (usuario == null)
            return NotFound(new { mensagem = "Usuário não encontrado." });

        if (!BCrypt.Net.BCrypt.Verify(dto.SenhaAtual, usuario.HashSenha))
            return Unauthorized(new { mensagem = "Senha atual incorreta." });

        usuario.HashSenha = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
        _context.SaveChanges();

        return Ok(new { mensagem = "Senha alterada com sucesso." });

    } 
}