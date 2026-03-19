using Microsoft.AspNetCore.Mvc;

namespace CapShop.AuthService.Controllers
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
                service = "AuthService",
                status = "Running",
                time = DateTime.UtcNow
            });
        }
    }
}