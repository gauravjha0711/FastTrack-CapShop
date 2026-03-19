using Microsoft.AspNetCore.Mvc;

namespace CapShop.AdminService.Controllers
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
                service = "AdminService",
                status = "Running",
                time = DateTime.UtcNow
            });
        }
    }
}