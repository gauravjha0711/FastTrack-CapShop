using CapShop.PaymentService.DTOs;
using CapShop.PaymentService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CapShop.PaymentService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IRazorpayGateway _razorpayGateway;
        private readonly IOrderServiceClient _orderServiceClient;
        private readonly IConfiguration _configuration;

        public PaymentController(
            IRazorpayGateway razorpayGateway,
            IOrderServiceClient orderServiceClient,
            IConfiguration configuration)
        {
            _razorpayGateway = razorpayGateway;
            _orderServiceClient = orderServiceClient;
            _configuration = configuration;
        }

        [Authorize(Roles = "Customer")]
        [HttpPost("razorpay/create-order")]
        public async Task<ActionResult<RazorpayCreateOrderResponseDto>> CreateRazorpayOrder(CancellationToken cancellationToken)
        {
            try
            {
                var bearer = Request.Headers.Authorization.ToString();
                if (string.IsNullOrWhiteSpace(bearer))
                {
                    return Unauthorized(new { message = "Missing Authorization header." });
                }

                var cart = await _orderServiceClient.GetCartAsync(bearer, cancellationToken);
                if (cart.Items == null || cart.Items.Count == 0)
                {
                    return BadRequest(new { message = "Cart is empty. Cannot create payment." });
                }

                var amountPaise = ToPaise(cart.TotalAmount);
                if (amountPaise <= 0)
                {
                    return BadRequest(new { message = "Invalid cart total." });
                }

                var currency = _configuration["Razorpay:Currency"] ?? "INR";
                var companyName = _configuration["Razorpay:CompanyName"] ?? "CapShop";
                var keyId = _configuration["Razorpay:KeyId"] ?? string.Empty;
                var keySecret = _configuration["Razorpay:KeySecret"] ?? string.Empty;
                var testMode = _configuration.GetValue<bool>("Razorpay:TestMode", true);

                if (string.IsNullOrWhiteSpace(keyId) || string.IsNullOrWhiteSpace(keySecret))
                {
                    return StatusCode(500, new
                    {
                        message = "Razorpay is not configured on server. Set Razorpay__KeyId and Razorpay__KeySecret for PaymentService."
                    });
                }

                var receipt = $"capshop_{cart.UserId}_{DateTime.UtcNow:yyyyMMddHHmmss}";
                var orderResult = await _razorpayGateway.CreateOrderAsync(amountPaise, currency, receipt, cancellationToken);

                return Ok(new RazorpayCreateOrderResponseDto
                {
                    KeyId = keyId,
                    OrderId = orderResult.RazorpayOrderId,
                    Amount = orderResult.AmountPaise,
                    Currency = orderResult.Currency,
                    CompanyName = companyName,
                    TestMode = testMode
                });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Unable to create Razorpay order." });
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpPost("razorpay/verify")]
        public ActionResult<RazorpayVerifyPaymentResponseDto> VerifyRazorpayPayment([FromBody] RazorpayVerifyPaymentRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var verified = _razorpayGateway.VerifySignature(
                    request.RazorpayOrderId,
                    request.RazorpayPaymentId,
                    request.RazorpaySignature);

                return Ok(new RazorpayVerifyPaymentResponseDto
                {
                    Verified = verified
                });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Unable to verify Razorpay payment." });
            }
        }

        private static int ToPaise(decimal amountRupees)
        {
            if (amountRupees < 0) return 0;
            return (int)Math.Round(amountRupees * 100m, MidpointRounding.AwayFromZero);
        }
    }
}
