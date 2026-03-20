using CapShop.CatalogService.Data;
using CapShop.CatalogService.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CapShop.CatalogService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CatalogController : ControllerBase
    {
        private readonly CatalogDbContext _context;

        public CatalogController(CatalogDbContext context)
        {
            _context = context;
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.Name)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description,
                    c.ImageUrl
                })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("featured")]
        public async Task<IActionResult> GetFeaturedProducts()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsActive && p.IsFeatured)
                .OrderByDescending(p => p.CreatedAt)
                .Take(6)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.Stock,
                    p.ImageUrl,
                    CategoryName = p.Category != null ? p.Category.Name : "",
                    p.IsFeatured
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetProducts([FromQuery] ProductQueryParametersDto query)
        {
            var productQuery = _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsActive)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var searchTerm = query.Search.Trim().ToLower();

                productQuery = productQuery.Where(p =>
                    p.Name.ToLower().Contains(searchTerm) ||
                    p.Description.ToLower().Contains(searchTerm) ||
                    (p.Category != null && p.Category.Name.ToLower().Contains(searchTerm)));
            }

            if (query.CategoryId.HasValue && query.CategoryId.Value > 0)
            {
                productQuery = productQuery.Where(p => p.CategoryId == query.CategoryId.Value);
            }

            productQuery = query.SortBy?.ToLower() switch
            {
                "priceasc" => productQuery.OrderBy(p => p.Price),
                "pricedesc" => productQuery.OrderByDescending(p => p.Price),
                "nameasc" => productQuery.OrderBy(p => p.Name),
                "namedesc" => productQuery.OrderByDescending(p => p.Name),
                _ => productQuery.OrderByDescending(p => p.CreatedAt)
            };

            var totalCount = await productQuery.CountAsync();

            var items = await productQuery
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.Stock,
                    p.ImageUrl,
                    p.CategoryId,
                    CategoryName = p.Category != null ? p.Category.Name : "",
                    p.IsFeatured
                })
                .ToListAsync();

            var response = new ProductListResponseDto
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / query.PageSize)
            };

            return Ok(response);
        }

        [HttpGet("products/{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsActive && p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.Stock,
                    p.ImageUrl,
                    p.CategoryId,
                    CategoryName = p.Category != null ? p.Category.Name : "",
                    p.IsFeatured,
                    p.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (product == null)
            {
                return NotFound(new
                {
                    message = "Product not found"
                });
            }

            return Ok(product);
        }
    }
}