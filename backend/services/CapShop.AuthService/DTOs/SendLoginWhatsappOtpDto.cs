using System.ComponentModel.DataAnnotations;

namespace CapShop.AuthService.DTOs
{
    public class SendLoginWhatsappOtpDto
    {
        [Required]
        public string TempLoginToken { get; set; } = string.Empty;
    }
}
