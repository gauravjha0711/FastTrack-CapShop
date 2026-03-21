using System.ComponentModel.DataAnnotations;

namespace CapShop.OrderService.DTOs
{
    public class PaymentSimulationRequestDto
    {
        [Required]
        [MaxLength(30)]
        public string PaymentMethod { get; set; } = string.Empty;

        public bool SimulateSuccess { get; set; } = true;
    }
}