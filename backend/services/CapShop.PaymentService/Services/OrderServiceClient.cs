using CapShop.PaymentService.Services.Models;
using System.Net.Http.Headers;
using System.Text.Json;

namespace CapShop.PaymentService.Services
{
    public sealed class OrderServiceClient : IOrderServiceClient
    {
        private readonly HttpClient _httpClient;

        public OrderServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<OrderServiceCartResponseDto> GetCartAsync(string authorizationHeaderValue, CancellationToken cancellationToken)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, "api/Orders/cart");
            request.Headers.Authorization = AuthenticationHeaderValue.Parse(authorizationHeaderValue);

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException("Failed to fetch cart from OrderService.");
            }

            var cart = JsonSerializer.Deserialize<OrderServiceCartResponseDto>(body, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return cart ?? new OrderServiceCartResponseDto();
        }
    }
}
