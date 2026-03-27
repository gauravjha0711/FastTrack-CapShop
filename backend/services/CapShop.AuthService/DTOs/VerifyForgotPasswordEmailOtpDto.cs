using System.ComponentModel.DataAnnotations;

namespace CapShop.AuthService.DTOs
{
    public class VerifyForgotPasswordEmailOtpDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string ChallengeToken { get; set; } = string.Empty;

        [Required]
        public string Otp { get; set; } = string.Empty;
    }
}