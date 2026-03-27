using System.ComponentModel.DataAnnotations;

namespace CapShop.AuthService.DTOs
{
    public class VerifyLoginAuthenticatorDto
    {
        [Required]
        public string TempLoginToken { get; set; } = string.Empty;

        [Required]
        public string Otp { get; set; } = string.Empty;
    }
}