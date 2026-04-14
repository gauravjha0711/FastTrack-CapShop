using CapShop.Messaging.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace CapShop.Messaging.RabbitMq;

public sealed class RabbitMqConnection : IDisposable
{
    private readonly RabbitMqOptions _options;
    private readonly ILogger<RabbitMqConnection> _logger;
    private readonly object _sync = new();

    private IConnection? _connection;

    public RabbitMqConnection(IOptions<RabbitMqOptions> options, ILogger<RabbitMqConnection> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public IConnection GetOrCreateConnection()
    {
        if (_connection != null && _connection.IsOpen)
        {
            return _connection;
        }

        lock (_sync)
        {
            if (_connection != null && _connection.IsOpen)
            {
                return _connection;
            }

            _connection?.Dispose();
            _connection = CreateConnection();
            return _connection;
        }
    }

    private IConnection CreateConnection()
    {
        if (!_options.Enabled)
        {
            throw new InvalidOperationException("RabbitMQ is disabled (RabbitMq:Enabled=false).");
        }

        var factory = new ConnectionFactory
        {
            HostName = _options.HostName,
            Port = _options.Port,
            UserName = _options.UserName,
            Password = _options.Password,
            VirtualHost = _options.VirtualHost,
            DispatchConsumersAsync = true,
            AutomaticRecoveryEnabled = true,
            NetworkRecoveryInterval = TimeSpan.FromSeconds(5)
        };

        if (_options.UseSsl)
        {
            factory.Ssl.Enabled = true;
            factory.Ssl.ServerName = _options.HostName;
        }

        _logger.LogInformation("Connecting to RabbitMQ at {Host}:{Port} vhost={VHost}", _options.HostName, _options.Port, _options.VirtualHost);
        return factory.CreateConnection("capshop");
    }

    public void Dispose()
    {
        try
        {
            _connection?.Dispose();
        }
        catch
        {
            // best-effort dispose
        }
    }
}
