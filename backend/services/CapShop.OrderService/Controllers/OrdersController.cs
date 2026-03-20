using CapShop.OrderService.Data;
using CapShop.OrderService.DTOs;
using CapShop.OrderService.Models;
using CapShop.OrderService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CapShop.OrderService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly OrderDbContext _context;
        private readonly ICatalogClientService _catalogClientService;

        public OrdersController(OrderDbContext context, ICatalogClientService catalogClientService)
        {
            _context = context;
            _catalogClientService = catalogClientService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim))
            {
                throw new UnauthorizedAccessException("User id not found in token.");
            }

            return int.Parse(userIdClaim);
        }

        private static CartResponseDto MapCartToResponse(Cart cart)
        {
            var items = cart.Items.Select(i => new CartItemResponseDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                LineTotal = i.UnitPrice * i.Quantity,
                ProductImageUrl = i.ProductImageUrl
            }).ToList();

            return new CartResponseDto
            {
                CartId = cart.Id,
                UserId = cart.UserId,
                Items = items,
                TotalAmount = items.Sum(i => i.LineTotal)
            };
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("cart")]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetCurrentUserId();

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return Ok(new CartResponseDto
                {
                    CartId = 0,
                    UserId = userId,
                    Items = new List<CartItemResponseDto>(),
                    TotalAmount = 0
                });
            }

            return Ok(MapCartToResponse(cart));
        }

        [Authorize(Roles = "Customer")]
        [HttpPost("cart/items")]
        public async Task<IActionResult> AddToCart(AddToCartRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();

            var product = await _catalogClientService.GetProductByIdAsync(request.ProductId);

            if (product == null)
            {
                return NotFound(new { message = "Product not found." });
            }

            if (product.Stock <= 0)
            {
                return BadRequest(new { message = "Product is out of stock." });
            }

            if (request.Quantity > product.Stock)
            {
                return BadRequest(new { message = "Requested quantity exceeds available stock." });
            }

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);

            if (existingItem != null)
            {
                var newQuantity = existingItem.Quantity + request.Quantity;

                if (newQuantity > product.Stock)
                {
                    return BadRequest(new { message = "Total quantity exceeds available stock." });
                }

                existingItem.Quantity = newQuantity;
                existingItem.UnitPrice = product.Price;
                existingItem.ProductName = product.Name;
                existingItem.ProductImageUrl = product.ImageUrl;
            }
            else
            {
                cart.Items.Add(new CartItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    UnitPrice = product.Price,
                    Quantity = request.Quantity,
                    ProductImageUrl = product.ImageUrl
                });
            }

            cart.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            cart = await _context.Carts
                .Include(c => c.Items)
                .FirstAsync(c => c.UserId == userId);

            return Ok(new
            {
                message = "Item added to cart successfully.",
                cart = MapCartToResponse(cart)
            });
        }

        [Authorize(Roles = "Customer")]
        [HttpPut("cart/items/{itemId}")]
        public async Task<IActionResult> UpdateCartItemQuantity(int itemId, UpdateCartItemQuantityDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return NotFound(new { message = "Cart not found." });
            }

            var item = cart.Items.FirstOrDefault(i => i.Id == itemId);

            if (item == null)
            {
                return NotFound(new { message = "Cart item not found." });
            }

            var product = await _catalogClientService.GetProductByIdAsync(item.ProductId);

            if (product == null)
            {
                return NotFound(new { message = "Related product not found." });
            }

            if (product.Stock <= 0)
            {
                return BadRequest(new { message = "Product is out of stock." });
            }

            if (request.Quantity > product.Stock)
            {
                return BadRequest(new { message = "Requested quantity exceeds available stock." });
            }

            item.Quantity = request.Quantity;
            item.UnitPrice = product.Price;
            item.ProductName = product.Name;
            item.ProductImageUrl = product.ImageUrl;
            cart.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cart item quantity updated successfully."
            });
        }

        [Authorize(Roles = "Customer")]
        [HttpDelete("cart/items/{itemId}")]
        public async Task<IActionResult> RemoveCartItem(int itemId)
        {
            var userId = GetCurrentUserId();

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return NotFound(new { message = "Cart not found." });
            }

            var item = cart.Items.FirstOrDefault(i => i.Id == itemId);

            if (item == null)
            {
                return NotFound(new { message = "Cart item not found." });
            }

            _context.CartItems.Remove(item);
            cart.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Item removed from cart successfully."
            });
        }

        [Authorize(Roles = "Customer")]
        [HttpPost("checkout/start")]
        public async Task<IActionResult> StartCheckout(CheckoutAddressRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null || !cart.Items.Any())
            {
                return BadRequest(new
                {
                    message = "Cart is empty. Add items before checkout."
                });
            }

            var totalAmount = cart.Items.Sum(i => i.UnitPrice * i.Quantity);

            return Ok(new
            {
                message = "Checkout started successfully.",
                nextStep = "Delivery",
                shippingAddress = request,
                cartTotal = totalAmount
            });
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("my")]
        public IActionResult GetMyOrders()
        {
            return Ok(new List<object>());
        }
    }
}