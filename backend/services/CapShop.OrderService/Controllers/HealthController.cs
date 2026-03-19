using Microsoft.AspNetCore.Mvc;

namespace CapShop.OrderService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                service = "OrderService",
                status = "Running",
                time = DateTime.UtcNow
            });
        }
    }
}