using System.ComponentModel.DataAnnotations;

namespace CapShop.OrderService.DTOs
{
    public class AddToCartRequestDto
    {
        [Required]
        public int ProductId { get; set; }

        [Range(1, 100)]
        public int Quantity { get; set; } = 1;
    }
}