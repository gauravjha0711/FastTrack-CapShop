using CapShop.AuthService.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CapShop.AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        [HttpPost("signup")]
        public IActionResult Signup(RegisterRequestDto request)
        {
            return Ok(new
            {
                message = "User registered successfully (Day 1 mock response)",
                user = request
            });
        }

        [HttpPost("login")]
        public IActionResult Login(LoginRequestDto request)
        {
            if (request.Email == "admin@capshop.com" && request.Password == "Admin@123")
            {
                return Ok(new AuthResponseDto
                {
                    Token = "mock-admin-token",
                    Role = "Admin",
                    Email = request.Email,
                    FullName = "CapShop Admin"
                });
            }

            if (request.Email == "customer@capshop.com" && request.Password == "Customer@123")
            {
                return Ok(new AuthResponseDto
                {
                    Token = "mock-customer-token",
                    Role = "Customer",
                    Email = request.Email,
                    FullName = "CapShop Customer"
                });
            }

            return BadRequest(new
            {
                message = "Invalid email or password"
            });
        }
    }
}