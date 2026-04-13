namespace CapShop.Messaging.Abstractions;

public interface IIntegrationEvent
{
    Guid EventId { get; }
    DateTime OccurredUtc { get; }
}
