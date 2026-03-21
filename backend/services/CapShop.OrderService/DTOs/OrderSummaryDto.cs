namespace CapShop.OrderService.DTOs
{
    public class OrderSummaryDto
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string DeliveryOption { get; set; } = string.Empty;
        public int TotalItems { get; set; }
    }
}