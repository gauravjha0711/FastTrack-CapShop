using System.ComponentModel.DataAnnotations;

namespace CapShop.OrderService.DTOs
{
    public class UpdateCartItemQuantityDto
    {
        [Range(1, 100)]
        public int Quantity { get; set; }
    }
}