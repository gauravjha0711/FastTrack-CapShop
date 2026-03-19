using Microsoft.AspNetCore.Mvc;

namespace CapShop.CatalogService.Controllers
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
                service = "CatalogService",
                status = "Running",
                time = DateTime.UtcNow
            });
        }
    }
}