namespace CapShop.AdminService.DTOs
{
    public class AdminDashboardSummaryDto
    {
        public int TotalProducts { get; set; }
        public int ActiveProducts { get; set; }
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
        public decimal TotalSales { get; set; }
        public IEnumerable<object> RecentOrders { get; set; } = new List<object>();
    }
}