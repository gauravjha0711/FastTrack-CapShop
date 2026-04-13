namespace CapShop.Messaging.Options;

public sealed class RabbitMqConsumerOptions
{
    public string QueueName { get; set; } = string.Empty;
    public string RoutingKey { get; set; } = string.Empty;

    public ushort PrefetchCount { get; set; } = 16;

    public int RetryDelayMs { get; set; } = 10_000;
    public int MaxRetryCount { get; set; } = 5;
}
