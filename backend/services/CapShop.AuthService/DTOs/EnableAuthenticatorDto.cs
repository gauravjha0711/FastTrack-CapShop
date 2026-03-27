using System.ComponentModel.DataAnnotations;

namespace CapShop.AuthService.DTOs
{
    public class EnableAuthenticatorDto
    {
        [Required]
        public string Otp { get; set; } = string.Empty;
    }
}