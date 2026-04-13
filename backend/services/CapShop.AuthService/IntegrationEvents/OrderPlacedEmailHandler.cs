using CapShop.AuthService.Data;
using CapShop.AuthService.Services;
using CapShop.Messaging.Abstractions;
using CapShop.Messaging.Contracts;
using Microsoft.EntityFrameworkCore;

namespace CapShop.AuthService.IntegrationEvents;

public sealed class OrderPlacedEmailHandler : IIntegrationEventHandler<OrderPlacedIntegrationEvent>
{
    private readonly AuthDbContext _db;
    private readonly EmailService _emailService;
    private readonly ILogger<OrderPlacedEmailHandler> _logger;

    public OrderPlacedEmailHandler(AuthDbContext db, EmailService emailService, ILogger<OrderPlacedEmailHandler> logger)
    {
        _db = db;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task HandleAsync(OrderPlacedIntegrationEvent message, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == message.UserId, cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("OrderPlaced received for missing userId={UserId}. orderId={OrderId}", message.UserId, message.OrderId);
            return;
        }

        var subject = $"CapShop: Order #{message.OrderId} placed";
        var html = BuildOrderPlacedHtml(user.FullName, message);

        await _emailService.SendEmailAsync(user.Email, subject, html);

        _logger.LogInformation("Sent order placed email. orderId={OrderId} userId={UserId}", message.OrderId, message.UserId);
    }

    private static string BuildOrderPlacedHtml(string customerName, OrderPlacedIntegrationEvent message)
    {
        var itemsHtml = string.Join("", message.Items.Select(i =>
            $"<tr><td style='padding:8px;border-bottom:1px solid #eee'>{Escape(i.ProductName)}</td>" +
            $"<td style='padding:8px;border-bottom:1px solid #eee;text-align:right'>{i.Quantity}</td>" +
            $"<td style='padding:8px;border-bottom:1px solid #eee;text-align:right'>₹{i.UnitPrice:0.00}</td>" +
            $"<td style='padding:8px;border-bottom:1px solid #eee;text-align:right'>₹{i.LineTotal:0.00}</td></tr>"));

        return $@"
<html>
<head>
  <style>
    body {{ margin:0; padding:0; background:#f4f6f9; font-family: Arial, Helvetica, sans-serif; }}
    .main {{ max-width:720px; margin:30px auto; background:#fff; border-radius:12px; border:1px solid #e5e5e5; overflow:hidden; }}
    .header {{ background:#0d6efd; color:#fff; padding:20px; font-size:20px; text-align:center; font-weight:bold; }}
    .content {{ padding:24px; }}
    .muted {{ color:#666; font-size:13px; }}
    table {{ width:100%; border-collapse:collapse; margin-top:12px; }}
    th {{ text-align:left; font-size:13px; color:#333; padding:8px; border-bottom:2px solid #ddd; }}
    .total {{ font-size:18px; font-weight:bold; text-align:right; margin-top:12px; }}
    .footer {{ background:#f7f7f7; padding:15px; font-size:12px; color:#666; text-align:center; }}
  </style>
</head>
<body>
<div class='main'>
  <div class='header'>Order Placed Successfully</div>
  <div class='content'>
    <p>Hi <b>{Escape(customerName)}</b>,</p>
    <p class='muted'>Thanks for shopping with CapShop. Your order has been placed successfully.</p>

    <p><b>Order Id:</b> #{message.OrderId}<br/>
       <b>Status:</b> {Escape(message.Status)}<br/>
       <b>Placed At (UTC):</b> {message.OccurredUtc:yyyy-MM-dd HH:mm:ss} </p>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style='text-align:right'>Qty</th>
          <th style='text-align:right'>Price</th>
          <th style='text-align:right'>Total</th>
        </tr>
      </thead>
      <tbody>
        {itemsHtml}
      </tbody>
    </table>

    <div class='total'>Grand Total: ₹{message.TotalAmount:0.00}</div>

    <p class='muted'>We will notify you as your order status changes.</p>
  </div>
  <div class='footer'>© 2026 CapShop</div>
</div>
</body>
</html>";
    }

    private static string Escape(string? value)
    {
        return System.Net.WebUtility.HtmlEncode(value ?? string.Empty);
    }
}
