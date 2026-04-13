using CapShop.Messaging.Abstractions;

namespace CapShop.Messaging.Contracts;

public sealed record OrderStatusChangedIntegrationEvent(
    Guid EventId,
    DateTime OccurredUtc,
    int OrderId,
    int UserId,
    string? OldStatus,
    string NewStatus
) : IIntegrationEvent;
