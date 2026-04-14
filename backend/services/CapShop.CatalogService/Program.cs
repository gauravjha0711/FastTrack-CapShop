using CapShop.CatalogService.Data;
using CapShop.CatalogService.IntegrationEvents;
using CapShop.CatalogService.Services;
using CapShop.CatalogService.Services.Chatbot;
using CapShop.Messaging.Contracts;
using CapShop.Messaging.DependencyInjection;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<CatalogDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<IChatbotService, MockChatbotService>();

builder.Services.AddCapShopRabbitMq(builder.Configuration);
builder.Services.AddRabbitMqConsumer<InventoryReservationRequestedIntegrationEvent, InventoryReservationRequestedHandler>(
    builder.Configuration.GetSection("RabbitMq:Consumers:InventoryReservation"));

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

app.UseAuthorization();

app.MapControllers();

await CatalogDbSeeder.SeedAsync(app);

app.Run();