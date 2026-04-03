namespace CapShop.Gateway.Configuration
{
    public class GatewayRedisCacheOptions
    {
        public const string SectionName = "GatewayRedisCache";

        public bool Enabled { get; set; } = true;

        public string ConnectionString { get; set; } = "localhost:6379";

        public string InstanceName { get; set; } = "CapShopGateway:";

        public int DefaultTtlSeconds { get; set; } = 120;

        public bool CacheOnlyAnonymousGetRequests { get; set; } = true;

        public int MaxBodySizeBytes { get; set; } = 1024 * 1024; // 1 MB

        public List<string> CacheablePathPrefixes { get; set; } = new()
        {
            "/gateway/catalog",
            "/gateway/products",
            "/gateway/categories"
        };
    }
}