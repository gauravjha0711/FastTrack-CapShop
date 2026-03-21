using System.ComponentModel.DataAnnotations;

namespace CapShop.OrderService.DTOs
{
    public class AdminUpdateOrderStatusDto
    {
        [Required]
        [MaxLength(30)]
        public string Status { get; set; } = string.Empty;
    }
}