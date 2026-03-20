using CapShop.OrderService.DTOs;

namespace CapShop.OrderService.Services
{
    public interface ICatalogClientService
    {
        Task<CatalogProductInfoDto?> GetProductByIdAsync(int productId);
    }
}