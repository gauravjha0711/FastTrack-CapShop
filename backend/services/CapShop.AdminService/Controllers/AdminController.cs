using CapShop.AdminService.DTOs;
using CapShop.AdminService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CapShop.AdminService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ICatalogAdminClientService _catalogClientService;
        private readonly IOrderAdminClientService _orderClientService;

        public AdminController(
            ICatalogAdminClientService catalogClientService,
            IOrderAdminClientService orderClientService)
        {
            _catalogClientService = catalogClientService;
            _orderClientService = orderClientService;
        }

        [HttpGet("dashboard/summary")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var products = await _catalogClientService.GetProductsAsync();
            dynamic? orderSummary = await _orderClientService.GetDashboardSummaryAsync();

            var totalProducts = products.Count;
            var activeProducts = products.Count(p => p.IsActive);

            return Ok(new
            {
                totalProducts,
                activeProducts,
                totalOrders = orderSummary?.totalOrders ?? 0,
                pendingOrders = orderSummary?.pendingOrders ?? 0,
                totalSales = orderSummary?.totalSales ?? 0,
                recentOrders = orderSummary?.recentOrders ?? new List<object>()
            });
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _catalogClientService.GetProductsAsync();
            return Ok(products);
        }

        [HttpPost("products")]
        public async Task<IActionResult> CreateProduct(AdminCreateProductDto request)
        {
            var result = await _catalogClientService.CreateProductAsync(request);
            return Ok(result);
        }

        [HttpPut("products/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, AdminUpdateProductDto request)
        {
            var result = await _catalogClientService.UpdateProductAsync(id, request);
            return Ok(result);
        }

        [HttpDelete("products/{id}")]
        public async Task<IActionResult> DeactivateProduct(int id)
        {
            var result = await _catalogClientService.DeactivateProductAsync(id);
            return Ok(result);
        }

        [HttpPut("products/{id}/stock")]
        public async Task<IActionResult> UpdateStock(int id, AdminUpdateStockDto request)
        {
            var result = await _catalogClientService.UpdateStockAsync(id, request);
            return Ok(result);
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetOrders()
        {
            var orders = await _orderClientService.GetOrdersAsync();
            return Ok(orders);
        }

        [HttpPut("orders/{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, AdminUpdateOrderStatusDto request)
        {
            var result = await _orderClientService.UpdateOrderStatusAsync(id, request);
            return Ok(result);
        }

        [HttpGet("reports/sales")]
        public async Task<IActionResult> GetSalesReport()
        {
            var result = await _orderClientService.GetSalesReportAsync();
            return Ok(result);
        }

        [HttpGet("reports/status-split")]
        public async Task<IActionResult> GetStatusSplitReport()
        {
            var result = await _orderClientService.GetStatusSplitReportAsync();
            return Ok(result);
        }
    }
}