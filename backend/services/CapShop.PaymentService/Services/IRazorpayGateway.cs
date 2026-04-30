using CapShop.PaymentService.Services.Models;

namespace CapShop.PaymentService.Services
{
    public interface IRazorpayGateway
    {
        Task<RazorpayCreateOrderResult> CreateOrderAsync(int amountPaise, string currency, string receipt, CancellationToken cancellationToken);
        bool VerifySignature(string razorpayOrderId, string razorpayPaymentId, string razorpaySignature);
    }
}
