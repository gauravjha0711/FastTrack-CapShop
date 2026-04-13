using CapShop.Messaging.Abstractions;

namespace CapShop.Messaging.Contracts;

public sealed record InventoryReservationFailedItem(
    int ProductId,
    int RequestedQuantity,
    int AvailableStock,
    string Reason);

public sealed record InventoryReservationFailedIntegrationEvent(
    Guid EventId,
    DateTime OccurredUtc,
    Guid CorrelationId,
    int OrderId,
    int UserId,
    string Reason,
    IReadOnlyList<InventoryReservationFailedItem> Items
) : IIntegrationEvent;
