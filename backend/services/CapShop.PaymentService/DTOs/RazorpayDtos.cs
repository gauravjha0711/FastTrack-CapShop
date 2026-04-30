using System.ComponentModel.DataAnnotations;

namespace CapShop.PaymentService.DTOs
{
    public sealed class RazorpayCreateOrderResponseDto
    {
        public string KeyId { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public int Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string CompanyName { get; set; } = "CapShop";
        public bool TestMode { get; set; }
    }

    public sealed class RazorpayVerifyPaymentRequestDto
    {
        [Required]
        public string RazorpayOrderId { get; set; } = string.Empty;

        [Required]
        public string RazorpayPaymentId { get; set; } = string.Empty;

        [Required]
        public string RazorpaySignature { get; set; } = string.Empty;
    }

    public sealed class RazorpayVerifyPaymentResponseDto
    {
        public bool Verified { get; set; }
    }
}
