namespace CapShop.OrderService.DTOs
{
    public class CartResponseDto
    {
        public int CartId { get; set; }
        public int UserId { get; set; }
        public List<CartItemResponseDto> Items { get; set; } = new();
        public decimal TotalAmount { get; set; }
    }
}