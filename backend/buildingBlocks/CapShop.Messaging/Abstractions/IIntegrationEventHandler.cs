namespace CapShop.Messaging.Abstractions;

public interface IIntegrationEventHandler<in TMessage>
{
    Task HandleAsync(TMessage message, CancellationToken cancellationToken);
}
