namespace CapShop.Gateway.Models
{
    public class CachedHttpResponse
    {
        public int StatusCode { get; set; }

        public string ContentType { get; set; } = "application/json";

        public string Body { get; set; } = string.Empty;
    }
}