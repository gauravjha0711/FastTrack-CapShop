using CapShop.OrderService.DTOs;
using System.Net.Http.Json;

namespace CapShop.OrderService.Services
{
    public class CatalogClientService : ICatalogClientService
    {
        private readonly HttpClient _httpClient;

        public CatalogClientService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<CatalogProductInfoDto?> GetProductByIdAsync(int productId)
        {
            try
            {
                var response = await _httpClient.GetAsync($"/api/Catalog/products/{productId}");

                if (!response.IsSuccessStatusCode)
                {
                    return null;
                }

                return await response.Content.ReadFromJsonAsync<CatalogProductInfoDto>();
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> ReduceStockAsync(int productId, int quantity)
        {
            try
            {
                var response = await _httpClient.PutAsJsonAsync(
                    $"/api/Catalog/products/{productId}/stock/reduce",
                    new ReduceStockRequestDto { Quantity = quantity });

                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
    }
}