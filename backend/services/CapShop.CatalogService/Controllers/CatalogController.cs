using CapShop.CatalogService.Data;
using CapShop.CatalogService.DTOs;
using CapShop.CatalogService.Models;
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
                .Where(p => p.Id == id)
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
                    p.CreatedAt,
                    p.IsActive
                })
                .FirstOrDefaultAsync();

            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            return Ok(product);
        }

        [HttpPut("products/{id}/stock/reduce")]
        public async Task<IActionResult> ReduceStock(int id, ReduceStockRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id && p.IsActive);

            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

            if (request.Quantity > product.Stock)
            {
                return BadRequest(new { message = "Insufficient stock" });
            }

            product.Stock -= request.Quantity;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Stock reduced successfully",
                productId = product.Id,
                remainingStock = product.Stock
            });
        }

        [HttpGet("admin/products")]
        public async Task<IActionResult> GetAdminProducts()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .OrderByDescending(p => p.CreatedAt)
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
                    p.IsActive,
                    p.CreatedAt
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpPost("admin/products")]
        public async Task<IActionResult> CreateProduct(AdminCreateProductDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Invalid category selected." });
            }

            var product = new Product
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                Stock = request.Stock,
                CategoryId = request.CategoryId,
                ImageUrl = request.ImageUrl,
                IsFeatured = request.IsFeatured,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Product created successfully.",
                productId = product.Id
            });
        }

        [HttpPut("admin/products/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, AdminUpdateProductDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found." });
            }

            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Invalid category selected." });
            }

            product.Name = request.Name;
            product.Description = request.Description;
            product.Price = request.Price;
            product.Stock = request.Stock;
            product.CategoryId = request.CategoryId;
            product.ImageUrl = request.ImageUrl;
            product.IsFeatured = request.IsFeatured;
            product.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Product updated successfully." });
        }

        [HttpDelete("admin/products/{id}")]
        public async Task<IActionResult> DeactivateProduct(int id)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found." });
            }

            product.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product deactivated successfully." });
        }

        [HttpPut("admin/products/{id}/stock")]
        public async Task<IActionResult> UpdateStock(int id, UpdateStockRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found." });
            }

            product.Stock = request.Stock;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Stock updated successfully." });
        }
    }
}