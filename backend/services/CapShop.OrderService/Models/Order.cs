namespace CapShop.OrderService.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Draft";
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    }
}