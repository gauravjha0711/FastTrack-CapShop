using System.ComponentModel.DataAnnotations;

namespace CapShop.AdminService.DTOs
{
    public class AdminUpdateOrderStatusDto
    {
        [Required]
        [MaxLength(30)]
        public string Status { get; set; } = string.Empty;
    }
}