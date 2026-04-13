namespace CapShop.Messaging.Contracts;

public static class RabbitMqRoutingKeys
{
    public const string OrderPlaced = "order.placed";
    public const string OrderStatusChanged = "order.status-changed";
}
