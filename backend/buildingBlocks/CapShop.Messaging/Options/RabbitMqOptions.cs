namespace CapShop.Messaging.Options;

public sealed class RabbitMqOptions
{
    public string HostName { get; set; } = "localhost";
    public int Port { get; set; } = 5672;
    public string UserName { get; set; } = "guest";
    public string Password { get; set; } = "guest";
    public string VirtualHost { get; set; } = "/";

    public string ExchangeName { get; set; } = "capshop.events";

    public bool UseSsl { get; set; } = false;
}
