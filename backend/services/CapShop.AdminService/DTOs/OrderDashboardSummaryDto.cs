namespace CapShop.AdminService.DTOs
{
    public class OrderDashboardSummaryDto
    {
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
        public decimal TotalSales { get; set; }
        public List<RecentOrderDto> RecentOrders { get; set; } = new();
    }

    public class RecentOrderDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public DateTime OrderDate { get; set; }
    }
}