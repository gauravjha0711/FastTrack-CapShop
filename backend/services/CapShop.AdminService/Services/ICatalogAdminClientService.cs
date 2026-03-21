using CapShop.AdminService.DTOs;

namespace CapShop.AdminService.Services
{
    public interface ICatalogAdminClientService
    {
        Task<List<AdminProductDto>> GetProductsAsync();
        Task<object?> CreateProductAsync(AdminCreateProductDto request);
        Task<object?> UpdateProductAsync(int id, AdminUpdateProductDto request);
        Task<object?> DeactivateProductAsync(int id);
        Task<object?> UpdateStockAsync(int id, AdminUpdateStockDto request);
    }
}