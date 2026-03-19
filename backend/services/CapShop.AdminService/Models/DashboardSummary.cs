namespace CapShop.AdminService.Models
{
    public class DashboardSummary
    {
        public int Id { get; set; }
        public int TotalProducts { get; set; }
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
    }
}