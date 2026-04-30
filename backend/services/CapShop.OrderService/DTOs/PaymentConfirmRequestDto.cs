using System.ComponentModel.DataAnnotations;

namespace CapShop.OrderService.DTOs
{
    public sealed class PaymentConfirmRequestDto
    {
        [Required]
        [MaxLength(30)]
        public string PaymentMethod { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PaymentStatus { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? PaymentReference { get; set; }
    }
}
