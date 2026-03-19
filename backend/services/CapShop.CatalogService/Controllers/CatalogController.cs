using Microsoft.AspNetCore.Mvc;

namespace CapShop.CatalogService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CatalogController : ControllerBase
    {
        [HttpGet("featured")]
        public IActionResult GetFeaturedProducts()
        {
            var products = new[]
            {
                new { Id = 1, Name = "Blue Cap", Price = 299, Stock = 20 },
                new { Id = 2, Name = "Black Cap", Price = 399, Stock = 10 },
                new { Id = 3, Name = "Red Cap", Price = 349, Stock = 15 }
            };

            return Ok(products);
        }

        [HttpGet("products")]
        public IActionResult GetProducts()
        {
            var products = new[]
            {
                new { Id = 1, Name = "Blue Cap", Price = 299, Category = "Casual" },
                new { Id = 2, Name = "Black Cap", Price = 399, Category = "Premium" },
                new { Id = 3, Name = "Red Cap", Price = 349, Category = "Sports" }
            };

            return Ok(products);
        }
    }
}