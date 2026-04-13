using CapShop.Messaging.Abstractions;

namespace CapShop.Messaging.Contracts;

public sealed record InventoryReservedIntegrationEvent(
    Guid EventId,
    DateTime OccurredUtc,
    Guid CorrelationId,
    int OrderId,
    int UserId
) : IIntegrationEvent;
