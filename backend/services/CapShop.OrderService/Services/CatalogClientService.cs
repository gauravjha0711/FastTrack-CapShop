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

                var product = await response.Content.ReadFromJsonAsync<CatalogProductInfoDto>();

                return product;
            }
            catch
            {
                return null;
            }
        }
    }
}