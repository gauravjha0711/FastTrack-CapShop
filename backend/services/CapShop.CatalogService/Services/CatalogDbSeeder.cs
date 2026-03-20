using CapShop.CatalogService.Data;
using CapShop.CatalogService.Models;
using Microsoft.EntityFrameworkCore;

namespace CapShop.CatalogService.Services
{
    public static class CatalogDbSeeder
    {
        public static async Task SeedAsync(WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<CatalogDbContext>();

            await dbContext.Database.MigrateAsync();

            if (await dbContext.Categories.AnyAsync() || await dbContext.Products.AnyAsync())
            {
                return;
            }

            var categories = new List<Category>
            {
                new Category
                {
                    Name = "Casual Caps",
                    Description = "Comfortable everyday wear caps",
                    ImageUrl = "https://images.unsplash.com/photo-1521369909029-2afed882baee"
                },
                new Category
                {
                    Name = "Sports Caps",
                    Description = "Performance-focused caps for active wear",
                    ImageUrl = "https://images.unsplash.com/photo-1517841905240-472988babdf9"
                },
                new Category
                {
                    Name = "Premium Caps",
                    Description = "Stylish premium caps for modern fashion",
                    ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                }
            };

            dbContext.Categories.AddRange(categories);
            await dbContext.SaveChangesAsync();

            var products = new List<Product>
            {
                new Product
                {
                    Name = "Classic Blue Cap",
                    Description = "A stylish blue cap perfect for daily casual wear with breathable fabric and adjustable fit.",
                    Price = 299,
                    Stock = 12,
                    CategoryId = categories[0].Id,
                    ImageUrl = "https://images.unsplash.com/photo-1521369909029-2afed882baee",
                    IsFeatured = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new Product
                {
                    Name = "Urban Black Cap",
                    Description = "Minimal black cap with premium finish, ideal for modern street style.",
                    Price = 399,
                    Stock = 8,
                    CategoryId = categories[2].Id,
                    ImageUrl = "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c",
                    IsFeatured = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-8)
                },
                new Product
                {
                    Name = "Red Sports Cap",
                    Description = "Sweat-resistant sports cap designed for runners and outdoor training sessions.",
                    Price = 349,
                    Stock = 20,
                    CategoryId = categories[1].Id,
                    ImageUrl = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f",
                    IsFeatured = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-7)
                },
                new Product
                {
                    Name = "Grey Training Cap",
                    Description = "Lightweight grey cap made for training and active movement.",
                    Price = 279,
                    Stock = 15,
                    CategoryId = categories[1].Id,
                    ImageUrl = "https://images.unsplash.com/photo-1576566588028-4147f3842f27",
                    IsFeatured = false,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-6)
                },
                new Product
                {
                    Name = "White Premium Cap",
                    Description = "Elegant premium white cap for clean and refined looks.",
                    Price = 499,
                    Stock = 5,
                    CategoryId = categories[2].Id,
                    ImageUrl = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518",
                    IsFeatured = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new Product
                {
                    Name = "Navy Casual Cap",
                    Description = "Soft cotton navy cap for comfortable daily use.",
                    Price = 259,
                    Stock = 18,
                    CategoryId = categories[0].Id,
                    ImageUrl = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
                    IsFeatured = false,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-4)
                },
                new Product
                {
                    Name = "Olive Outdoor Cap",
                    Description = "Outdoor-ready olive cap with durable stitching and sun protection feel.",
                    Price = 329,
                    Stock = 0,
                    CategoryId = categories[0].Id,
                    ImageUrl = "https://images.unsplash.com/photo-1523398002811-999ca8dec234",
                    IsFeatured = false,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                },
                new Product
                {
                    Name = "Performance Mesh Cap",
                    Description = "Mesh sports cap with enhanced airflow and flexible fitting.",
                    Price = 379,
                    Stock = 11,
                    CategoryId = categories[1].Id,
                    ImageUrl = "https://images.unsplash.com/photo-1483985988355-763728e1935b",
                    IsFeatured = false,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new Product
                {
                    Name = "Luxury Maroon Cap",
                    Description = "Premium maroon cap with polished design for standout fashion appeal.",
                    Price = 549,
                    Stock = 6,
                    CategoryId = categories[2].Id,
                    ImageUrl = "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
                    IsFeatured = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                }
            };

            dbContext.Products.AddRange(products);
            await dbContext.SaveChangesAsync();
        }
    }
}