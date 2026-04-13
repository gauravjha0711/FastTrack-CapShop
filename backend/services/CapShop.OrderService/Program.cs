using CapShop.OrderService.Data;
using CapShop.OrderService.IntegrationEvents;
using CapShop.OrderService.Services;
using CapShop.Messaging.Contracts;
using CapShop.Messaging.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<OrderDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpClient<ICatalogClientService, CatalogClientService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["CatalogService:BaseUrl"]!);
});

builder.Services.AddCapShopRabbitMq(builder.Configuration);
builder.Services.AddRabbitMqConsumer<InventoryReservedIntegrationEvent, InventoryReservedHandler>(
    builder.Configuration.GetSection("RabbitMq:Consumers:InventoryReserved"));
builder.Services.AddRabbitMqConsumer<InventoryReservationFailedIntegrationEvent, InventoryReservationFailedHandler>(
    builder.Configuration.GetSection("RabbitMq:Consumers:InventoryReservationFailed"));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSettings = builder.Configuration.GetSection("JwtSettings");
        var key = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();