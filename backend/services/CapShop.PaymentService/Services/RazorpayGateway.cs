using CapShop.PaymentService.Services.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace CapShop.PaymentService.Services
{
    public sealed class RazorpayGateway : IRazorpayGateway
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<RazorpayGateway> _logger;

        public RazorpayGateway(HttpClient httpClient, IConfiguration configuration, ILogger<RazorpayGateway> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<RazorpayCreateOrderResult> CreateOrderAsync(int amountPaise, string currency, string receipt, CancellationToken cancellationToken)
        {
            var keyId = _configuration["Razorpay:KeyId"];
            var keySecret = _configuration["Razorpay:KeySecret"];

            if (string.IsNullOrWhiteSpace(keyId) || string.IsNullOrWhiteSpace(keySecret))
            {
                throw new InvalidOperationException("Razorpay credentials are not configured. Set Razorpay:KeyId and Razorpay:KeySecret via environment variables/user-secrets.");
            }

            var payload = new
            {
                amount = amountPaise,
                currency,
                receipt,
                payment_capture = 1
            };

            using var request = new HttpRequestMessage(HttpMethod.Post, "v1/orders");
            request.Headers.Authorization = new AuthenticationHeaderValue(
                "Basic",
                Convert.ToBase64String(Encoding.ASCII.GetBytes($"{keyId}:{keySecret}")));

            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Razorpay order creation failed. Status: {Status}. Body: {Body}", response.StatusCode, body);
                throw new InvalidOperationException("Failed to create Razorpay order.");
            }

            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            var orderId = root.GetProperty("id").GetString() ?? string.Empty;
            var status = root.TryGetProperty("status", out var statusEl) ? statusEl.GetString() ?? string.Empty : string.Empty;
            var receiptRes = root.TryGetProperty("receipt", out var receiptEl) ? receiptEl.GetString() ?? receipt : receipt;

            if (string.IsNullOrWhiteSpace(orderId))
            {
                throw new InvalidOperationException("Razorpay did not return an order id.");
            }

            return new RazorpayCreateOrderResult(orderId, amountPaise, currency, status, receiptRes);
        }

        public bool VerifySignature(string razorpayOrderId, string razorpayPaymentId, string razorpaySignature)
        {
            var keySecret = _configuration["Razorpay:KeySecret"];

            if (string.IsNullOrWhiteSpace(keySecret))
            {
                throw new InvalidOperationException("Razorpay KeySecret is not configured.");
            }

            var payload = $"{razorpayOrderId}|{razorpayPaymentId}";
            var secretBytes = Encoding.UTF8.GetBytes(keySecret);
            var payloadBytes = Encoding.UTF8.GetBytes(payload);

            using var hmac = new HMACSHA256(secretBytes);
            var computed = hmac.ComputeHash(payloadBytes);
            var computedHex = Convert.ToHexString(computed).ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(razorpaySignature)) return false;

            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(computedHex),
                Encoding.UTF8.GetBytes(razorpaySignature.Trim().ToLowerInvariant()));
        }
    }
}
