using System.Text;
using System.Text.Json;
using CapShop.Gateway.Configuration;
using CapShop.Gateway.Models;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;

namespace CapShop.Gateway.Middleware
{
    public class RedisResponseCacheMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IDistributedCache _cache;
        private readonly GatewayRedisCacheOptions _options;
        private readonly ILogger<RedisResponseCacheMiddleware> _logger;

        public RedisResponseCacheMiddleware(
            RequestDelegate next,
            IDistributedCache cache,
            IOptions<GatewayRedisCacheOptions> options,
            ILogger<RedisResponseCacheMiddleware> logger)
        {
            _next = next;
            _cache = cache;
            _options = options.Value;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (!ShouldUseCache(context))
            {
                await _next(context);
                return;
            }

            var cacheKey = BuildCacheKey(context.Request);

            try
            {
                var cachedValue = await _cache.GetStringAsync(cacheKey);

                if (!string.IsNullOrWhiteSpace(cachedValue))
                {
                    var cachedResponse = JsonSerializer.Deserialize<CachedHttpResponse>(cachedValue);

                    if (cachedResponse is not null)
                    {
                        _logger.LogInformation("Redis cache HIT for key: {CacheKey}", cacheKey);

                        context.Response.StatusCode = cachedResponse.StatusCode;
                        context.Response.ContentType = cachedResponse.ContentType;

                        await context.Response.WriteAsync(cachedResponse.Body);
                        return;
                    }
                }

                _logger.LogInformation("Redis cache MISS for key: {CacheKey}", cacheKey);

                var originalResponseBody = context.Response.Body;

                await using var memoryStream = new MemoryStream();
                context.Response.Body = memoryStream;

                await _next(context);

                memoryStream.Position = 0;
                var responseBody = await new StreamReader(memoryStream).ReadToEndAsync();

                if (CanStoreInCache(context, responseBody))
                {
                    var cacheEntry = new CachedHttpResponse
                    {
                        StatusCode = context.Response.StatusCode,
                        ContentType = context.Response.ContentType ?? "application/json",
                        Body = responseBody
                    };

                    var serialized = JsonSerializer.Serialize(cacheEntry);

                    var distributedCacheOptions = new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(_options.DefaultTtlSeconds)
                    };

                    await _cache.SetStringAsync(cacheKey, serialized, distributedCacheOptions);

                    _logger.LogInformation(
                        "Response cached in Redis for key: {CacheKey}, TTL: {TtlSeconds}s",
                        cacheKey,
                        _options.DefaultTtlSeconds);
                }

                memoryStream.Position = 0;
                await memoryStream.CopyToAsync(originalResponseBody);
                context.Response.Body = originalResponseBody;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Redis cache middleware error. Request will continue normally.");
                await _next(context);
            }
        }

        private bool ShouldUseCache(HttpContext context)
        {
            if (!_options.Enabled)
                return false;

            if (!HttpMethods.IsGet(context.Request.Method))
                return false;

            if (_options.CacheOnlyAnonymousGetRequests &&
                context.Request.Headers.ContainsKey("Authorization"))
                return false;

            var requestPath = context.Request.Path.Value ?? string.Empty;

            if (string.IsNullOrWhiteSpace(requestPath))
                return false;

            return _options.CacheablePathPrefixes.Any(prefix =>
                requestPath.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
        }

        private bool CanStoreInCache(HttpContext context, string responseBody)
        {
            if (context.Response.StatusCode != StatusCodes.Status200OK)
                return false;

            if (string.IsNullOrWhiteSpace(responseBody))
                return false;

            var bodySize = Encoding.UTF8.GetByteCount(responseBody);
            if (bodySize > _options.MaxBodySizeBytes)
                return false;

            var contentType = context.Response.ContentType ?? string.Empty;

            if (!contentType.Contains("application/json", StringComparison.OrdinalIgnoreCase) &&
                !string.IsNullOrWhiteSpace(contentType))
                return false;

            return true;
        }

        private static string BuildCacheKey(HttpRequest request)
        {
            var path = request.Path.Value?.ToLowerInvariant() ?? string.Empty;
            var query = request.QueryString.HasValue
                ? request.QueryString.Value!.ToLowerInvariant()
                : string.Empty;

            return $"gateway-cache:{request.Method}:{path}{query}";
        }
    }
}