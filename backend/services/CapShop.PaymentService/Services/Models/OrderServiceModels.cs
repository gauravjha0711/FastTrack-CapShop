namespace CapShop.PaymentService.Services.Models
{
    public sealed class OrderServiceCartItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }
        public string ProductImageUrl { get; set; } = string.Empty;
    }

    public sealed class OrderServiceCartResponseDto
    {
        public int CartId { get; set; }
        public int UserId { get; set; }
        public List<OrderServiceCartItemDto> Items { get; set; } = new();
        public decimal TotalAmount { get; set; }
    }
}
