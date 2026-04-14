using CapShop.Messaging.Abstractions;
using CapShop.Messaging.Options;
using CapShop.Messaging.RabbitMq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CapShop.Messaging.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCapShopRabbitMq(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<RabbitMqOptions>()
            .Bind(configuration.GetSection("RabbitMq"))
            .Validate(o => !o.Enabled || !string.IsNullOrWhiteSpace(o.HostName), "RabbitMq:HostName is required")
            .Validate(o => !o.Enabled || !string.IsNullOrWhiteSpace(o.ExchangeName), "RabbitMq:ExchangeName is required")
            .ValidateOnStart();

        services.AddSingleton<RabbitMqConnection>();
        services.AddSingleton<IRabbitMqPublisher, RabbitMqPublisher>();

        return services;
    }

    public static IServiceCollection AddRabbitMqConsumer<TMessage, THandler>(
        this IServiceCollection services,
        IConfigurationSection consumerSection)
        where THandler : class, IIntegrationEventHandler<TMessage>
    {
        var options = new RabbitMqConsumerOptions();
        consumerSection.Bind(options);

        if (string.IsNullOrWhiteSpace(options.QueueName))
        {
            throw new InvalidOperationException($"RabbitMq consumer option 'QueueName' is required for section '{consumerSection.Path}'.");
        }

        if (string.IsNullOrWhiteSpace(options.RoutingKey))
        {
            throw new InvalidOperationException($"RabbitMq consumer option 'RoutingKey' is required for section '{consumerSection.Path}'.");
        }

        services.AddScoped<THandler>();

        services.AddHostedService(sp =>
            ActivatorUtilities.CreateInstance<RabbitMqConsumerHostedService<TMessage, THandler>>(sp, options));

        return services;
    }
}
