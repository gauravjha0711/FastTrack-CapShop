using CapShop.AuthService.Data;
using CapShop.AuthService.DTOs;
using CapShop.AuthService.Models;
using CapShop.AuthService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CapShop.AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthDbContext _context;
        private readonly IPasswordHasherService _passwordHasher;
        private readonly IJwtTokenService _jwtTokenService;

        public AuthController(
            AuthDbContext context,
            IPasswordHasherService passwordHasher,
            IJwtTokenService jwtTokenService)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _jwtTokenService = jwtTokenService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim))
            {
                throw new UnauthorizedAccessException("User id not found in token.");
            }

            return int.Parse(userIdClaim);
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup(RegisterRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var normalizedEmail = request.Email.Trim().ToLower();
            var normalizedUsername = request.Username.Trim().ToLower();

            var existingEmail = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

            if (existingEmail != null)
            {
                return BadRequest(new
                {
                    message = "Email already registered"
                });
            }

            var existingUsername = await _context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == normalizedUsername);

            if (existingUsername != null)
            {
                return BadRequest(new
                {
                    message = "Username already taken"
                });
            }

            var user = new User
            {
                Username = request.Username.Trim(),
                FullName = request.FullName.Trim(),
                Email = normalizedEmail,
                Phone = request.Phone.Trim(),
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                RoleName = "Customer",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Signup successful"
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var normalizedEmail = request.Email.Trim().ToLower();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == normalizedEmail && u.IsActive);

            if (user == null)
            {
                return BadRequest(new
                {
                    message = "Invalid email or password"
                });
            }

            var isPasswordValid = _passwordHasher.VerifyPassword(request.Password, user.PasswordHash);

            if (!isPasswordValid)
            {
                return BadRequest(new
                {
                    message = "Invalid email or password"
                });
            }

            var token = _jwtTokenService.GenerateToken(user);

            var response = new AuthResponseDto
            {
                Token = token,
                Role = user.RoleName,
                UserId = user.Id,
                Name = user.FullName,
                Username = user.Username,
                Email = user.Email
            };

            return Ok(response);
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = GetCurrentUserId();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found"
                });
            }

            var profile = new UserProfileDto
            {
                UserId = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl,
                AddressLine = user.AddressLine,
                City = user.City,
                State = user.State,
                Pincode = user.Pincode,
                RoleName = user.RoleName
            };

            return Ok(profile);
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found"
                });
            }

            var normalizedUsername = request.Username.Trim().ToLower();

            var existingUsername = await _context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == normalizedUsername && u.Id != userId);

            if (existingUsername != null)
            {
                return BadRequest(new
                {
                    message = "Username already taken"
                });
            }

            user.Username = request.Username.Trim();
            user.FullName = request.FullName.Trim();
            user.Phone = request.Phone.Trim();
            user.AvatarUrl = request.AvatarUrl?.Trim();
            user.AddressLine = request.AddressLine?.Trim();
            user.City = request.City?.Trim();
            user.State = request.State?.Trim();
            user.Pincode = request.Pincode?.Trim();

            await _context.SaveChangesAsync();

            var profile = new UserProfileDto
            {
                UserId = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                AvatarUrl = user.AvatarUrl,
                AddressLine = user.AddressLine,
                City = user.City,
                State = user.State,
                Pincode = user.Pincode,
                RoleName = user.RoleName
            };

            return Ok(profile);
        }

        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest(new
                {
                    message = "New password and confirm password do not match"
                });
            }

            var userId = GetCurrentUserId();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found"
                });
            }

            var isOldPasswordValid = _passwordHasher.VerifyPassword(request.OldPassword, user.PasswordHash);

            if (!isOldPasswordValid)
            {
                return BadRequest(new
                {
                    message = "Old password is incorrect"
                });
            }

            user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Password changed successfully"
            });
        }
    }
}