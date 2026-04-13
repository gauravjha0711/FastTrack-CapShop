namespace CapShop.Messaging.Contracts;

public static class RabbitMqRoutingKeys
{
    public const string OrderPlaced = "order.placed";
    public const string OrderStatusChanged = "order.status-changed";

    public const string InventoryReserveRequested = "inventory.reserve";
    public const string InventoryReserved = "inventory.reserved";
    public const string InventoryReserveFailed = "inventory.reserve-failed";
}
