using System.ComponentModel.DataAnnotations;

namespace CapShop.OrderService.Models
{
    public class CheckoutSession
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string AddressLine { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string State { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string Pincode { get; set; } = string.Empty;

        [MaxLength(30)]
        public string PaymentMethod { get; set; } = string.Empty;

        [MaxLength(30)]
        public string PaymentStatus { get; set; } = "Pending";

        [MaxLength(100)]
        public string? PaymentReference { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}