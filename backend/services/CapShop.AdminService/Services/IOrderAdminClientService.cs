using CapShop.AdminService.DTOs;

namespace CapShop.AdminService.Services
{
    public interface IOrderAdminClientService
    {
        Task<List<AdminOrderDto>> GetOrdersAsync();
        Task<object?> UpdateOrderStatusAsync(int id, AdminUpdateOrderStatusDto request);
        Task<OrderDashboardSummaryDto?> GetDashboardSummaryAsync();
        Task<object?> GetSalesReportAsync();
        Task<object?> GetStatusSplitReportAsync();
    }
}