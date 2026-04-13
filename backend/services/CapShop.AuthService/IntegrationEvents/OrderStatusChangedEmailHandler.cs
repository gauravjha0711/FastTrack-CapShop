using CapShop.AuthService.Data;
using CapShop.AuthService.Services;
using CapShop.Messaging.Abstractions;
using CapShop.Messaging.Contracts;
using Microsoft.EntityFrameworkCore;

namespace CapShop.AuthService.IntegrationEvents;

public sealed class OrderStatusChangedEmailHandler : IIntegrationEventHandler<OrderStatusChangedIntegrationEvent>
{
    private readonly AuthDbContext _db;
    private readonly EmailService _emailService;
    private readonly ILogger<OrderStatusChangedEmailHandler> _logger;

    public OrderStatusChangedEmailHandler(AuthDbContext db, EmailService emailService, ILogger<OrderStatusChangedEmailHandler> logger)
    {
        _db = db;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task HandleAsync(OrderStatusChangedIntegrationEvent message, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == message.UserId, cancellationToken);

        if (user == null)
        {
            _logger.LogWarning("OrderStatusChanged received for missing userId={UserId}. orderId={OrderId}", message.UserId, message.OrderId);
            return;
        }

        var subject = $"CapShop: Order #{message.OrderId} status updated";
        var html = BuildOrderStatusChangedHtml(user.FullName, message);

        await _emailService.SendEmailAsync(user.Email, subject, html);

        _logger.LogInformation(
            "Sent order status email. orderId={OrderId} userId={UserId} old={Old} new={New}",
            message.OrderId,
            message.UserId,
            message.OldStatus,
            message.NewStatus);
    }

    private static string BuildOrderStatusChangedHtml(string customerName, OrderStatusChangedIntegrationEvent message)
    {
        var oldStatus = Escape(message.OldStatus ?? "(unknown)");
        var newStatus = Escape(message.NewStatus);

        return $@"
<html>
<head>
  <style>
    body {{ margin:0; padding:0; background:#f4f6f9; font-family: Arial, Helvetica, sans-serif; }}
    .main {{ max-width:720px; margin:30px auto; background:#fff; border-radius:12px; border:1px solid #e5e5e5; overflow:hidden; }}
    .header {{ background:#0d6efd; color:#fff; padding:20px; font-size:20px; text-align:center; font-weight:bold; }}
    .content {{ padding:24px; }}
    .pill {{ display:inline-block; padding:6px 10px; border-radius:999px; background:#f1f5ff; color:#0d6efd; font-weight:bold; }}
    .muted {{ color:#666; font-size:13px; }}
    .footer {{ background:#f7f7f7; padding:15px; font-size:12px; color:#666; text-align:center; }}
  </style>
</head>
<body>
<div class='main'>
  <div class='header'>Order Status Updated</div>
  <div class='content'>
    <p>Hi <b>{Escape(customerName)}</b>,</p>
    <p class='muted'>Your order status has been updated.</p>

    <p><b>Order Id:</b> #{message.OrderId}<br/>
       <b>Changed At (UTC):</b> {message.OccurredUtc:yyyy-MM-dd HH:mm:ss}</p>

    <p>Previous: <span class='pill'>{oldStatus}</span></p>
    <p>Current: <span class='pill'>{newStatus}</span></p>

    <p class='muted'>Thank you for shopping with CapShop.</p>
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
