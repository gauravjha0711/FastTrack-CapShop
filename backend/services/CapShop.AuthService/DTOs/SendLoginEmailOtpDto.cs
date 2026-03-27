using System.ComponentModel.DataAnnotations;

namespace CapShop.AuthService.DTOs
{
    public class SendLoginEmailOtpDto
    {
        [Required]
        public string TempLoginToken { get; set; } = string.Empty;
    }
}