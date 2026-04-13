using CapShop.Messaging.Abstractions;
using CapShop.Messaging.Contracts;
using CapShop.OrderService.Data;
using Microsoft.EntityFrameworkCore;

namespace CapShop.OrderService.IntegrationEvents;

public sealed class InventoryReservedHandler(
    OrderDbContext dbContext,
    IRabbitMqPublisher publisher,
    ILogger<InventoryReservedHandler> logger)
    : IIntegrationEventHandler<InventoryReservedIntegrationEvent>
{
    public async Task HandleAsync(InventoryReservedIntegrationEvent message, CancellationToken cancellationToken)
    {
        var order = await dbContext.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == message.OrderId, cancellationToken);

        if (order is null)
        {
            logger.LogWarning("InventoryReserved for missing order. orderId={OrderId} correlationId={CorrelationId}", message.OrderId, message.CorrelationId);
            return;
        }

        if (!string.Equals(order.Status, "Pending", StringComparison.OrdinalIgnoreCase))
        {
            logger.LogInformation("InventoryReserved ignored because order status is {Status}. orderId={OrderId}", order.Status, order.Id);
            return;
        }

        order.Status = "Paid";
        await dbContext.SaveChangesAsync(cancellationToken);

        var orderPlacedEvent = new OrderPlacedIntegrationEvent(
            EventId: Guid.NewGuid(),
            OccurredUtc: DateTime.UtcNow,
            OrderId: order.Id,
            UserId: order.UserId,
            TotalAmount: order.TotalAmount,
            Status: order.Status,
            FullName: order.FullName,
            DeliveryOption: order.DeliveryOption,
            Items: order.OrderItems.Select(i => new OrderItemSnapshot(
                ProductId: i.ProductId,
                ProductName: i.ProductName,
                UnitPrice: i.UnitPrice,
                Quantity: i.Quantity,
                LineTotal: i.LineTotal
            )).ToList()
        );

        await publisher.PublishAsync(orderPlacedEvent, RabbitMqRoutingKeys.OrderPlaced, cancellationToken);

        logger.LogInformation("Order confirmed (inventory reserved) and OrderPlaced published. orderId={OrderId}", order.Id);
    }
}
