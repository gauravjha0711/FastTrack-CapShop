using CapShop.Gateway.Configuration;
using CapShop.Gateway.Middleware;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Load configuration files
builder.Configuration
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddJsonFile("ocelot.json", optional: false, reloadOnChange: true)
    .AddEnvironmentVariables();

// Bind custom redis cache config
builder.Services.Configure<GatewayRedisCacheOptions>(
    builder.Configuration.GetSection(GatewayRedisCacheOptions.SectionName));

var redisSettings = builder.Configuration
    .GetSection(GatewayRedisCacheOptions.SectionName)
    .Get<GatewayRedisCacheOptions>() ?? new GatewayRedisCacheOptions();

// Add Redis distributed cache
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = redisSettings.ConnectionString;
    options.InstanceName = redisSettings.InstanceName;
});

// Ocelot
builder.Services.AddOcelot(builder.Configuration);

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS if needed
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Swagger
app.UseSwagger();
app.UseSwaggerUI();

// CORS
app.UseCors("AllowFrontend");

// HTTPS
app.UseHttpsRedirection();

// Custom Redis cache middleware
app.UseMiddleware<RedisResponseCacheMiddleware>();

// Ocelot pipeline
await app.UseOcelot();

app.Run();