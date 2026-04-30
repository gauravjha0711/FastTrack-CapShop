namespace CapShop.PaymentService.Services.Models
{
    public sealed record RazorpayCreateOrderResult(
        string RazorpayOrderId,
        int AmountPaise,
        string Currency,
        string Status,
        string Receipt);
}
