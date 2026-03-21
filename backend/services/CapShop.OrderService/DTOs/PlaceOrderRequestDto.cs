using System.ComponentModel.DataAnnotations;

namespace CapShop.OrderService.DTOs
{
    public class PlaceOrderRequestDto
    {
        [Required]
        [MaxLength(30)]
        public string DeliveryOption { get; set; } = "Standard";
    }
}