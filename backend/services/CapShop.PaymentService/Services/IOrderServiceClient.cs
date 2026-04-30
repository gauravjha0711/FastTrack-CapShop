using CapShop.PaymentService.Services.Models;

namespace CapShop.PaymentService.Services
{
    public interface IOrderServiceClient
    {
        Task<OrderServiceCartResponseDto> GetCartAsync(string authorizationHeaderValue, CancellationToken cancellationToken);
    }
}
