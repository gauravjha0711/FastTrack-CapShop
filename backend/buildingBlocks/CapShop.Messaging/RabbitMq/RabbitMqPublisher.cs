using System.Text;
using System.Text.Json;
using CapShop.Messaging.Abstractions;
using CapShop.Messaging.Options;
using CapShop.Messaging.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace CapShop.Messaging.RabbitMq;

public sealed class RabbitMqPublisher : IRabbitMqPublisher
{
    private readonly RabbitMqConnection _connection;
    private readonly RabbitMqOptions _options;
    private readonly ILogger<RabbitMqPublisher> _logger;

    public RabbitMqPublisher(
        RabbitMqConnection connection,
        IOptions<RabbitMqOptions> options,
        ILogger<RabbitMqPublisher> logger)
    {
        _connection = connection;
        _options = options.Value;
        _logger = logger;
    }

    public Task PublishAsync<TMessage>(TMessage message, string routingKey, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (!_options.Enabled)
        {
            _logger.LogDebug(
                "RabbitMQ is disabled (RabbitMq:Enabled=false). Skipping publish of {MessageType} routingKey={RoutingKey}.",
                typeof(TMessage).Name,
                routingKey);
            return Task.CompletedTask;
        }

        var connection = _connection.GetOrCreateConnection();
        using var channel = connection.CreateModel();

        channel.ExchangeDeclare(
            exchange: _options.ExchangeName,
            type: ExchangeType.Topic,
            durable: true,
            autoDelete: false,
            arguments: null);

        var bodyJson = JsonSerializer.Serialize(message, MessagingJsonSerializerOptions.Default);
        var body = Encoding.UTF8.GetBytes(bodyJson);

        var props = channel.CreateBasicProperties();
        props.DeliveryMode = 2; // persistent
        props.ContentType = "application/json";
        props.Type = typeof(TMessage).FullName;

        if (message is IIntegrationEvent evt)
        {
            props.MessageId = evt.EventId.ToString();
            props.Timestamp = new AmqpTimestamp(new DateTimeOffset(evt.OccurredUtc).ToUnixTimeSeconds());
            props.CorrelationId = evt.EventId.ToString();
        }

        channel.BasicPublish(
            exchange: _options.ExchangeName,
            routingKey: routingKey,
            mandatory: false,
            basicProperties: props,
            body: body);

        _logger.LogInformation("Published RabbitMQ message {MessageType} to {Exchange} with routingKey={RoutingKey}", typeof(TMessage).Name, _options.ExchangeName, routingKey);

        return Task.CompletedTask;
    }
}
