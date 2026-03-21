using CapShop.AdminService.DTOs;
using System.Net.Http.Json;

namespace CapShop.AdminService.Services
{
    public class OrderAdminClientService : IOrderAdminClientService
    {
        private readonly HttpClient _httpClient;

        public OrderAdminClientService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<AdminOrderDto>> GetOrdersAsync()
        {
            var response = await _httpClient.GetFromJsonAsync<List<AdminOrderDto>>("/api/Orders/admin/all");
            return response ?? new List<AdminOrderDto>();
        }

        public async Task<object?> UpdateOrderStatusAsync(int id, AdminUpdateOrderStatusDto request)
        {
            var response = await _httpClient.PutAsJsonAsync($"/api/Orders/admin/{id}/status", request);
            return await response.Content.ReadFromJsonAsync<object>();
        }

        public async Task<object?> GetDashboardSummaryAsync()
        {
            return await _httpClient.GetFromJsonAsync<object>("/api/Orders/admin/dashboard-summary");
        }

        public async Task<object?> GetSalesReportAsync()
        {
            return await _httpClient.GetFromJsonAsync<object>("/api/Orders/admin/reports/sales");
        }

        public async Task<object?> GetStatusSplitReportAsync()
        {
            return await _httpClient.GetFromJsonAsync<object>("/api/Orders/admin/reports/status-split");
        }
    }
}