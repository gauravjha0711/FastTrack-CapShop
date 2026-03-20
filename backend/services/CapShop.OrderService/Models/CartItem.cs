using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CapShop.OrderService.Models
{
    public class CartItem
    {
        public int Id { get; set; }

        [Required]
        public int CartId { get; set; }

        public Cart? Cart { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        [MaxLength(150)]
        public string ProductName { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        public int Quantity { get; set; }

        public string? ProductImageUrl { get; set; }
    }
}