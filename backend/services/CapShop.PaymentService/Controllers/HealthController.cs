using Microsoft.AspNetCore.Mvc;

namespace CapShop.PaymentService.Controllers
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
                service = "PaymentService",
                status = "Running",
                time = DateTime.UtcNow
            });
        }
    }
}
