using CapShop.AdminService.DTOs;
using System.Net.Http.Json;

namespace CapShop.AdminService.Services
{
    public class CatalogAdminClientService : ICatalogAdminClientService
    {
        private readonly HttpClient _httpClient;

        public CatalogAdminClientService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<AdminProductDto>> GetProductsAsync()
        {
            var response = await _httpClient.GetFromJsonAsync<List<AdminProductDto>>("/api/Catalog/admin/products");
            return response ?? new List<AdminProductDto>();
        }

        public async Task<object?> CreateProductAsync(AdminCreateProductDto request)
        {
            var response = await _httpClient.PostAsJsonAsync("/api/Catalog/admin/products", request);
            return await response.Content.ReadFromJsonAsync<object>();
        }

        public async Task<object?> UpdateProductAsync(int id, AdminUpdateProductDto request)
        {
            var response = await _httpClient.PutAsJsonAsync($"/api/Catalog/admin/products/{id}", request);
            return await response.Content.ReadFromJsonAsync<object>();
        }

        public async Task<object?> DeactivateProductAsync(int id)
        {
            var response = await _httpClient.DeleteAsync($"/api/Catalog/admin/products/{id}");
            return await response.Content.ReadFromJsonAsync<object>();
        }

        public async Task<object?> UpdateStockAsync(int id, AdminUpdateStockDto request)
        {
            var response = await _httpClient.PutAsJsonAsync($"/api/Catalog/admin/products/{id}/stock", request);
            return await response.Content.ReadFromJsonAsync<object>();
        }
    }
}