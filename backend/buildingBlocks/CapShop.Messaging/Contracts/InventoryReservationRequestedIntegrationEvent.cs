using CapShop.Messaging.Abstractions;

namespace CapShop.Messaging.Contracts;

public sealed record InventoryReservationItem(
    int ProductId,
    int Quantity);

public sealed record InventoryReservationRequestedIntegrationEvent(
    Guid EventId,
    DateTime OccurredUtc,
    Guid CorrelationId,
    int OrderId,
    int UserId,
    IReadOnlyList<InventoryReservationItem> Items
) : IIntegrationEvent;
