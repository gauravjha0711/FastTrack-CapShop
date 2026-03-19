namespace CapShop.AdminService.Models
{
    public class SalesReport
    {
        public int Id { get; set; }
        public DateTime ReportDate { get; set; }
        public decimal TotalSales { get; set; }
    }
}