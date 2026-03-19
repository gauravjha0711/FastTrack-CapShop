using Microsoft.AspNetCore.Mvc;

namespace CapShop.AdminService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        [HttpGet("dashboard/summary")]
        public IActionResult GetDashboardSummary()
        {
            return Ok(new
            {
                totalProducts = 10,
                totalOrders = 25,
                pendingOrders = 5,
                totalSales = 15000
            });
        }

        [HttpGet("orders")]
        public IActionResult GetOrders()
        {
            return Ok(new[]
            {
                new { OrderId = 1001, Customer = "Rahul", Status = "Paid" },
                new { OrderId = 1002, Customer = "Aman", Status = "Shipped" }
            });
        }
    }
}