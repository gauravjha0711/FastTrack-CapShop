using CapShop.Messaging.Abstractions;

namespace CapShop.Messaging.Contracts;

public sealed record OrderItemSnapshot(
    int ProductId,
    string ProductName,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal);

public sealed record OrderPlacedIntegrationEvent(
    Guid EventId,
    DateTime OccurredUtc,
    int OrderId,
    int UserId,
    decimal TotalAmount,
    string Status,
    string? FullName,
    string? DeliveryOption,
    IReadOnlyList<OrderItemSnapshot> Items
) : IIntegrationEvent;
