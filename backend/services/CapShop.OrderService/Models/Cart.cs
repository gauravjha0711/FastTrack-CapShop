namespace CapShop.OrderService.Models
{
    public class Cart
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public decimal TotalAmount { get; set; }
    }
}