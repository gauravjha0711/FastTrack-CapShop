using CapShop.CatalogService.Data;
using CapShop.Messaging.Abstractions;
using CapShop.Messaging.Contracts;
using Microsoft.EntityFrameworkCore;

namespace CapShop.CatalogService.IntegrationEvents;

public sealed class InventoryReservationRequestedHandler(
    CatalogDbContext dbContext,
    IRabbitMqPublisher publisher,
    ILogger<InventoryReservationRequestedHandler> logger)
    : IIntegrationEventHandler<InventoryReservationRequestedIntegrationEvent>
{
    public async Task HandleAsync(InventoryReservationRequestedIntegrationEvent message, CancellationToken cancellationToken)
    {
        if (message.Items.Count == 0)
        {
            logger.LogWarning("Inventory reservation requested with no items. correlationId={CorrelationId} orderId={OrderId}", message.CorrelationId, message.OrderId);
            await PublishFailedAsync(message, "No items to reserve.", Array.Empty<InventoryReservationFailedItem>(), cancellationToken);
            return;
        }

        if (message.Items.Any(i => i.Quantity <= 0))
        {
            logger.LogWarning("Inventory reservation requested with invalid quantity. correlationId={CorrelationId} orderId={OrderId}", message.CorrelationId, message.OrderId);
            await PublishFailedAsync(message, "Invalid quantity in reservation request.", Array.Empty<InventoryReservationFailedItem>(), cancellationToken);
            return;
        }

        var productIds = message.Items.Select(i => i.ProductId).Distinct().ToList();

        var products = await dbContext.Products
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        var productsById = products.ToDictionary(p => p.Id);

        var failures = new List<InventoryReservationFailedItem>();

        foreach (var item in message.Items)
        {
            if (!productsById.TryGetValue(item.ProductId, out var product) || !product.IsActive)
            {
                failures.Add(new InventoryReservationFailedItem(
                    ProductId: item.ProductId,
                    RequestedQuantity: item.Quantity,
                    AvailableStock: 0,
                    Reason: "Product not found or inactive"));
                continue;
            }

            if (product.Stock < item.Quantity)
            {
                failures.Add(new InventoryReservationFailedItem(
                    ProductId: item.ProductId,
                    RequestedQuantity: item.Quantity,
                    AvailableStock: product.Stock,
                    Reason: "Insufficient stock"));
            }
        }

        if (failures.Count > 0)
        {
            logger.LogInformation(
                "Inventory reservation FAILED. correlationId={CorrelationId} orderId={OrderId} failures={FailureCount}",
                message.CorrelationId,
                message.OrderId,
                failures.Count);

            await PublishFailedAsync(message, "Inventory reservation failed.", failures, cancellationToken);
            return;
        }

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        foreach (var item in message.Items)
        {
            var product = productsById[item.ProductId];
            product.Stock -= item.Quantity;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        logger.LogInformation("Inventory reserved. correlationId={CorrelationId} orderId={OrderId}", message.CorrelationId, message.OrderId);

        var reservedEvent = new InventoryReservedIntegrationEvent(
            EventId: Guid.NewGuid(),
            OccurredUtc: DateTime.UtcNow,
            CorrelationId: message.CorrelationId,
            OrderId: message.OrderId,
            UserId: message.UserId);

        await publisher.PublishAsync(reservedEvent, RabbitMqRoutingKeys.InventoryReserved, cancellationToken);
    }

    private async Task PublishFailedAsync(
        InventoryReservationRequestedIntegrationEvent request,
        string reason,
        IReadOnlyList<InventoryReservationFailedItem> items,
        CancellationToken cancellationToken)
    {
        var failedEvent = new InventoryReservationFailedIntegrationEvent(
            EventId: Guid.NewGuid(),
            OccurredUtc: DateTime.UtcNow,
            CorrelationId: request.CorrelationId,
            OrderId: request.OrderId,
            UserId: request.UserId,
            Reason: reason,
            Items: items);

        await publisher.PublishAsync(failedEvent, RabbitMqRoutingKeys.InventoryReserveFailed, cancellationToken);
    }
}
