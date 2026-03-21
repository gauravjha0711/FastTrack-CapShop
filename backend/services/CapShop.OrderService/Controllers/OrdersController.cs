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

            if (!product.IsActive)
            {
                return BadRequest(new { message = "Product is inactive." });
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

            return Ok(new { message = "Cart item quantity updated successfully." });
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

            return Ok(new { message = "Item removed from cart successfully." });
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
                return BadRequest(new { message = "Cart is empty. Add items before checkout." });
            }

            var session = await _context.CheckoutSessions
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (session == null)
            {
                session = new CheckoutSession
                {
                    UserId = userId
                };

                _context.CheckoutSessions.Add(session);
            }

            session.FullName = request.FullName;
            session.Phone = request.Phone;
            session.AddressLine = request.AddressLine;
            session.City = request.City;
            session.State = request.State;
            session.Pincode = request.Pincode;
            session.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var totalAmount = cart.Items.Sum(i => i.UnitPrice * i.Quantity);

            return Ok(new
            {
                message = "Checkout address saved successfully.",
                nextStep = "Delivery",
                cartTotal = totalAmount
            });
        }

        [Authorize(Roles = "Customer")]
        [HttpPost("payment/simulate")]
        public async Task<IActionResult> SimulatePayment(PaymentSimulationRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();

            var session = await _context.CheckoutSessions
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (session == null)
            {
                return BadRequest(new { message = "Checkout session not found. Complete address step first." });
            }

            session.PaymentMethod = request.PaymentMethod;
            session.PaymentStatus = request.SimulateSuccess ? "Success" : "Failed";
            session.PaymentReference = request.SimulateSuccess
                ? $"PAY-{Guid.NewGuid().ToString("N")[..10].ToUpper()}"
                : null;
            session.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = request.SimulateSuccess ? "Payment simulated successfully." : "Payment simulation failed.",
                paymentStatus = session.PaymentStatus,
                paymentReference = session.PaymentReference
            });
        }

        [Authorize(Roles = "Customer")]
        [HttpPost("place")]
        public async Task<IActionResult> PlaceOrder(PlaceOrderRequestDto request)
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
                return BadRequest(new { message = "Cart is empty. Cannot place order." });
            }

            var session = await _context.CheckoutSessions
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (session == null)
            {
                return BadRequest(new { message = "Checkout session not found. Complete checkout steps first." });
            }

            if (!string.Equals(session.PaymentStatus, "Success", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Payment is not successful. Cannot place order." });
            }

            foreach (var item in cart.Items)
            {
                var latestProduct = await _catalogClientService.GetProductByIdAsync(item.ProductId);

                if (latestProduct == null)
                {
                    return BadRequest(new { message = $"Product not found for product id {item.ProductId}." });
                }

                if (!latestProduct.IsActive)
                {
                    return BadRequest(new { message = $"Product {item.ProductName} is inactive." });
                }

                if (latestProduct.Stock < item.Quantity)
                {
                    return BadRequest(new { message = $"Insufficient stock for product {item.ProductName}." });
                }
            }

            foreach (var item in cart.Items)
            {
                var reduced = await _catalogClientService.ReduceStockAsync(item.ProductId, item.Quantity);

                if (!reduced)
                {
                    return BadRequest(new { message = $"Failed to reduce stock for product {item.ProductName}." });
                }
            }

            var order = new Order
            {
                UserId = userId,
                TotalAmount = cart.Items.Sum(i => i.UnitPrice * i.Quantity),
                Status = "Paid",
                PaymentMethod = session.PaymentMethod,
                PaymentStatus = session.PaymentStatus,
                DeliveryOption = request.DeliveryOption,
                FullName = session.FullName,
                Phone = session.Phone,
                AddressLine = session.AddressLine,
                City = session.City,
                State = session.State,
                Pincode = session.Pincode,
                PaymentReference = session.PaymentReference,
                OrderDate = DateTime.UtcNow,
                OrderItems = cart.Items.Select(i => new OrderItem
                {
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    LineTotal = i.UnitPrice * i.Quantity,
                    ProductImageUrl = i.ProductImageUrl
                }).ToList()
            };

            _context.Orders.Add(order);

            _context.CartItems.RemoveRange(cart.Items);
            _context.CheckoutSessions.Remove(session);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Order placed successfully.",
                orderId = order.Id
            });
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = GetCurrentUserId();

            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrderSummaryDto
                {
                    Id = o.Id,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    PaymentMethod = o.PaymentMethod,
                    DeliveryOption = o.DeliveryOption,
                    TotalItems = o.OrderItems.Count
                })
                .ToListAsync();

            return Ok(orders);
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var userId = GetCurrentUserId();

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (order == null)
            {
                return NotFound(new { message = "Order not found." });
            }

            var response = new OrderDetailDto
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                DeliveryOption = order.DeliveryOption,
                FullName = order.FullName,
                Phone = order.Phone,
                AddressLine = order.AddressLine,
                City = order.City,
                State = order.State,
                Pincode = order.Pincode,
                PaymentReference = order.PaymentReference,
                Items = order.OrderItems.Select(i => new OrderItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    LineTotal = i.LineTotal,
                    ProductImageUrl = i.ProductImageUrl
                }).ToList()
            };

            return Ok(response);
        }

        [Authorize(Roles = "Customer")]
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var userId = GetCurrentUserId();

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (order == null)
            {
                return NotFound(new { message = "Order not found." });
            }

            var nonCancelableStatuses = new[] { "Packed", "Shipped", "Delivered", "Cancelled" };

            if (nonCancelableStatuses.Contains(order.Status, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Order cannot be cancelled after packed stage." });
            }

            order.Status = "Cancelled";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order cancelled successfully." });
        }

        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllOrdersForAdmin()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new
                {
                    o.Id,
                    o.UserId,
                    o.OrderDate,
                    o.TotalAmount,
                    o.Status,
                    o.PaymentMethod,
                    o.PaymentStatus,
                    o.DeliveryOption,
                    o.FullName,
                    o.Phone,
                    o.City,
                    o.State,
                    TotalItems = o.OrderItems.Count
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpPut("admin/{id}/status")]
        public async Task<IActionResult> UpdateOrderStatusByAdmin(int id, AdminUpdateOrderStatusDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var validStatuses = new[] { "Paid", "Packed", "Shipped", "Delivered", "Cancelled" };

            if (!validStatuses.Contains(request.Status, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Invalid order status." });
            }

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound(new { message = "Order not found." });
            }

            order.Status = request.Status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order status updated successfully." });
        }

        [HttpGet("admin/dashboard-summary")]
        public async Task<IActionResult> GetDashboardSummaryForAdmin()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var pendingOrders = await _context.Orders.CountAsync(o =>
                o.Status == "Paid" || o.Status == "Packed");
            var totalSales = await _context.Orders
                .Where(o => o.Status != "Cancelled")
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            var recentOrders = await _context.Orders
                .OrderByDescending(o => o.OrderDate)
                .Take(5)
                .Select(o => new
                {
                    o.Id,
                    o.FullName,
                    o.Status,
                    o.TotalAmount,
                    o.OrderDate
                })
                .ToListAsync();

            return Ok(new
            {
                totalOrders,
                pendingOrders,
                totalSales,
                recentOrders
            });
        }

        [HttpGet("admin/reports/status-split")]
        public async Task<IActionResult> GetStatusSplitReport()
        {
            var result = await _context.Orders
                .GroupBy(o => o.Status)
                .Select(g => new
                {
                    status = g.Key,
                    count = g.Count()
                })
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("admin/reports/sales")]
        public async Task<IActionResult> GetSalesReport()
        {
            var result = await _context.Orders
                .Where(o => o.Status != "Cancelled")
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new
                {
                    date = g.Key,
                    totalSales = g.Sum(x => x.TotalAmount),
                    orderCount = g.Count()
                })
                .OrderBy(x => x.date)
                .ToListAsync();

            return Ok(result);
        }
    }
}