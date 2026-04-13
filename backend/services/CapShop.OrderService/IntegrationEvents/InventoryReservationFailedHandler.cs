using CapShop.Messaging.Abstractions;
using CapShop.Messaging.Contracts;
using CapShop.OrderService.Data;
using Microsoft.EntityFrameworkCore;

namespace CapShop.OrderService.IntegrationEvents;

public sealed class InventoryReservationFailedHandler(
    OrderDbContext dbContext,
    IRabbitMqPublisher publisher,
    ILogger<InventoryReservationFailedHandler> logger)
    : IIntegrationEventHandler<InventoryReservationFailedIntegrationEvent>
{
    public async Task HandleAsync(InventoryReservationFailedIntegrationEvent message, CancellationToken cancellationToken)
    {
        var order = await dbContext.Orders
            .FirstOrDefaultAsync(o => o.Id == message.OrderId, cancellationToken);

        if (order is null)
        {
            logger.LogWarning("InventoryReservationFailed for missing order. orderId={OrderId} correlationId={CorrelationId}", message.OrderId, message.CorrelationId);
            return;
        }

        if (string.Equals(order.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
        {
            logger.LogInformation("InventoryReservationFailed ignored because order already cancelled. orderId={OrderId}", order.Id);
            return;
        }

        var oldStatus = order.Status;
        order.Status = "Cancelled";
        await dbContext.SaveChangesAsync(cancellationToken);

        var statusChangedEvent = new OrderStatusChangedIntegrationEvent(
            EventId: Guid.NewGuid(),
            OccurredUtc: DateTime.UtcNow,
            OrderId: order.Id,
            UserId: order.UserId,
            OldStatus: oldStatus,
            NewStatus: order.Status);

        await publisher.PublishAsync(statusChangedEvent, RabbitMqRoutingKeys.OrderStatusChanged, cancellationToken);

        logger.LogInformation(
            "Order cancelled due to inventory reservation failure. orderId={OrderId} reason={Reason}",
            order.Id,
            message.Reason);
    }
}
