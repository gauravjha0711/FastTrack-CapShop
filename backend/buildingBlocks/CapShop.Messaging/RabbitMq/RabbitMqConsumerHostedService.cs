using System.Text;
using System.Text.Json;
using CapShop.Messaging.Abstractions;
using CapShop.Messaging.Options;
using CapShop.Messaging.Serialization;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace CapShop.Messaging.RabbitMq;

public sealed class RabbitMqConsumerHostedService<TMessage, THandler> : BackgroundService
    where THandler : class, IIntegrationEventHandler<TMessage>
{
    private readonly IServiceProvider _serviceProvider;
    private readonly RabbitMqConnection _connection;
    private readonly RabbitMqOptions _busOptions;
    private readonly RabbitMqConsumerOptions _consumerOptions;
    private readonly ILogger<RabbitMqConsumerHostedService<TMessage, THandler>> _logger;

    private IModel? _channel;
    private string? _consumerTag;
    private CancellationToken _stoppingToken;

    public RabbitMqConsumerHostedService(
        IServiceProvider serviceProvider,
        RabbitMqConnection connection,
        IOptions<RabbitMqOptions> busOptions,
        RabbitMqConsumerOptions consumerOptions,
        ILogger<RabbitMqConsumerHostedService<TMessage, THandler>> logger)
    {
        _serviceProvider = serviceProvider;
        _connection = connection;
        _busOptions = busOptions.Value;
        _consumerOptions = consumerOptions;
        _logger = logger;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _stoppingToken = stoppingToken;

        if (string.IsNullOrWhiteSpace(_consumerOptions.QueueName))
        {
            throw new InvalidOperationException($"RabbitMq consumer queue name is missing for {typeof(TMessage).Name}.");
        }

        if (string.IsNullOrWhiteSpace(_consumerOptions.RoutingKey))
        {
            throw new InvalidOperationException($"RabbitMq consumer routing key is missing for {typeof(TMessage).Name}.");
        }

        return RunConsumerLoopAsync(stoppingToken);
    }

    private async Task RunConsumerLoopAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var connection = _connection.GetOrCreateConnection();
                _channel = connection.CreateModel();

                _channel.BasicQos(prefetchSize: 0, prefetchCount: _consumerOptions.PrefetchCount, global: false);

                DeclareTopology(_channel);

                var consumer = new AsyncEventingBasicConsumer(_channel);
                consumer.Received += OnMessageReceivedAsync;

                _consumerTag = _channel.BasicConsume(
                    queue: _consumerOptions.QueueName,
                    autoAck: false,
                    consumer: consumer);

                _logger.LogInformation(
                    "RabbitMQ consumer started queue={Queue} routingKey={RoutingKey} prefetch={Prefetch}",
                    _consumerOptions.QueueName,
                    _consumerOptions.RoutingKey,
                    _consumerOptions.PrefetchCount);

                stoppingToken.Register(() => StopConsumer());

                await Task.Delay(Timeout.InfiniteTimeSpan, stoppingToken);
                return;
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                return;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "RabbitMQ consumer failed to start. Will retry in 5s. queue={Queue} routingKey={RoutingKey}",
                    _consumerOptions.QueueName,
                    _consumerOptions.RoutingKey);

                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    return;
                }
            }
        }
    }

    private void DeclareTopology(IModel channel)
    {
        var exchange = _busOptions.ExchangeName;
        var dlx = exchange + ".dlx";
        var retryExchange = exchange + ".retry";

        var queue = _consumerOptions.QueueName;
        var dlq = queue + ".dlq";
        var retryQueue = queue + ".retry";

        channel.ExchangeDeclare(exchange, ExchangeType.Topic, durable: true, autoDelete: false);
        channel.ExchangeDeclare(dlx, ExchangeType.Direct, durable: true, autoDelete: false);
        channel.ExchangeDeclare(retryExchange, ExchangeType.Direct, durable: true, autoDelete: false);

        var mainQueueArgs = new Dictionary<string, object>
        {
            ["x-dead-letter-exchange"] = dlx,
            ["x-dead-letter-routing-key"] = dlq
        };

        channel.QueueDeclare(queue: queue, durable: true, exclusive: false, autoDelete: false, arguments: mainQueueArgs);
        channel.QueueBind(queue: queue, exchange: exchange, routingKey: _consumerOptions.RoutingKey);

        channel.QueueDeclare(queue: dlq, durable: true, exclusive: false, autoDelete: false);
        channel.QueueBind(queue: dlq, exchange: dlx, routingKey: dlq);

        var retryQueueArgs = new Dictionary<string, object>
        {
            ["x-message-ttl"] = _consumerOptions.RetryDelayMs,
            ["x-dead-letter-exchange"] = exchange,
            ["x-dead-letter-routing-key"] = _consumerOptions.RoutingKey
        };

        channel.QueueDeclare(queue: retryQueue, durable: true, exclusive: false, autoDelete: false, arguments: retryQueueArgs);
        channel.QueueBind(queue: retryQueue, exchange: retryExchange, routingKey: retryQueue);
    }

    private async Task OnMessageReceivedAsync(object sender, BasicDeliverEventArgs args)
    {
        if (_channel == null)
        {
            return;
        }

        var exchange = _busOptions.ExchangeName;
        var retryExchange = exchange + ".retry";
        var dlx = exchange + ".dlx";

        var queue = _consumerOptions.QueueName;
        var retryQueue = queue + ".retry";
        var dlq = queue + ".dlq";

        try
        {
            var json = Encoding.UTF8.GetString(args.Body.ToArray());
            var message = JsonSerializer.Deserialize<TMessage>(json, MessagingJsonSerializerOptions.Default);

            if (message == null)
            {
                throw new InvalidOperationException("Message deserialized to null.");
            }

            using var scope = _serviceProvider.CreateScope();
            var handler = scope.ServiceProvider.GetRequiredService<THandler>();

            await handler.HandleAsync(message, _stoppingToken);

            _channel.BasicAck(args.DeliveryTag, multiple: false);
        }
        catch (Exception ex)
        {
            var retryCount = GetRetryCount(args.BasicProperties);

            _logger.LogError(ex,
                "Error processing RabbitMQ message. queue={Queue} routingKey={RoutingKey} retryCount={RetryCount}",
                _consumerOptions.QueueName,
                args.RoutingKey,
                retryCount);

            if (retryCount < _consumerOptions.MaxRetryCount)
            {
                RepublishWithRetry(args, retryExchange, retryQueue, retryCount + 1);
                _channel.BasicAck(args.DeliveryTag, multiple: false);
                return;
            }

            RepublishToDeadLetter(args, dlx, dlq, retryCount);
            _channel.BasicAck(args.DeliveryTag, multiple: false);
        }
    }

    private static int GetRetryCount(IBasicProperties? props)
    {
        if (props?.Headers == null)
        {
            return 0;
        }

        if (!props.Headers.TryGetValue("x-retry-count", out var raw) || raw == null)
        {
            return 0;
        }

        if (raw is byte[] bytes)
        {
            var s = Encoding.UTF8.GetString(bytes);
            return int.TryParse(s, out var value) ? value : 0;
        }

        return raw switch
        {
            int i => i,
            long l => (int)l,
            _ => 0
        };
    }

    private void RepublishWithRetry(BasicDeliverEventArgs args, string retryExchange, string retryQueue, int nextRetryCount)
    {
        if (_channel == null)
        {
            return;
        }

        var props = _channel.CreateBasicProperties();
        props.DeliveryMode = 2;
        props.ContentType = args.BasicProperties?.ContentType ?? "application/json";
        props.Type = args.BasicProperties?.Type;
        props.MessageId = args.BasicProperties?.MessageId;
        props.CorrelationId = args.BasicProperties?.CorrelationId;

        props.Headers = args.BasicProperties?.Headers != null
            ? new Dictionary<string, object>(args.BasicProperties.Headers)
            : new Dictionary<string, object>();

        props.Headers["x-retry-count"] = nextRetryCount;

        _channel.BasicPublish(
            exchange: retryExchange,
            routingKey: retryQueue,
            mandatory: false,
            basicProperties: props,
            body: args.Body);

        _logger.LogWarning(
            "Republished message to retry queue={RetryQueue} nextRetryCount={NextRetryCount}",
            retryQueue,
            nextRetryCount);
    }

    private void RepublishToDeadLetter(BasicDeliverEventArgs args, string dlx, string dlq, int retryCount)
    {
        if (_channel == null)
        {
            return;
        }

        var props = _channel.CreateBasicProperties();
        props.DeliveryMode = 2;
        props.ContentType = args.BasicProperties?.ContentType ?? "application/json";
        props.Type = args.BasicProperties?.Type;
        props.MessageId = args.BasicProperties?.MessageId;
        props.CorrelationId = args.BasicProperties?.CorrelationId;

        props.Headers = args.BasicProperties?.Headers != null
            ? new Dictionary<string, object>(args.BasicProperties.Headers)
            : new Dictionary<string, object>();

        props.Headers["x-retry-count"] = retryCount;
        props.Headers["x-dead-lettered-at"] = DateTimeOffset.UtcNow.ToString("O");

        _channel.BasicPublish(
            exchange: dlx,
            routingKey: dlq,
            mandatory: false,
            basicProperties: props,
            body: args.Body);

        _logger.LogError(
            "Message moved to dead-letter queue={Dlq} retryCount={RetryCount}",
            dlq,
            retryCount);
    }

    private void StopConsumer()
    {
        try
        {
            if (_channel != null && !string.IsNullOrWhiteSpace(_consumerTag))
            {
                _channel.BasicCancel(_consumerTag);
            }
        }
        catch
        {
            // best-effort stop
        }
    }

    public override void Dispose()
    {
        try
        {
            _channel?.Dispose();
        }
        catch
        {
            // best-effort dispose
        }

        base.Dispose();
    }
}
