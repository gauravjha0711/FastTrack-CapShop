using Microsoft.AspNetCore.Mvc;

namespace CapShop.OrderService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        [HttpGet("cart")]
        public IActionResult GetCart()
        {
            return Ok(new
            {
                message = "Cart endpoint working",
                items = new[]
                {
                    new { ProductId = 1, ProductName = "Blue Cap", Quantity = 2, Price = 299 }
                }
            });
        }

        [HttpGet("my")]
        public IActionResult GetMyOrders()
        {
            return Ok(new[]
            {
                new { OrderId = 1001, Total = 598, Status = "Paid" },
                new { OrderId = 1002, Total = 349, Status = "Shipped" }
            });
        }
    }
}