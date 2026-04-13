namespace CapShop.Messaging.Abstractions;

public interface IRabbitMqPublisher
{
    Task PublishAsync<TMessage>(
        TMessage message,
        string routingKey,
        CancellationToken cancellationToken = default);
}
