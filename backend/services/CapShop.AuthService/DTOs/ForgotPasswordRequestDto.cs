using System.ComponentModel.DataAnnotations;

namespace CapShop.AuthService.DTOs
{
    public class ForgotPasswordRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Method { get; set; } = string.Empty; // Email or Authenticator
    }
}