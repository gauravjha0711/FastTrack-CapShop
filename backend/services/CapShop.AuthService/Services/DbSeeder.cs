using CapShop.AuthService.Data;
using CapShop.AuthService.Models;
using Microsoft.EntityFrameworkCore;

namespace CapShop.AuthService.Services
{
    public static class DbSeeder
    {
        public static async Task SeedAdminAsync(WebApplication app)
        {
            using var scope = app.Services.CreateScope();

            var dbContext = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
            var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasherService>();

            await dbContext.Database.MigrateAsync();

            if (!await dbContext.Users.AnyAsync(u => u.Email == "capshopadmin@gmail.com"))
            {
                var adminUser = new User
                {
                    Username = "admin",
                    FullName = "System Admin",
                    Email = "capshopadmin@gmail.com",
                    Phone = "9999999999",
                    PasswordHash = passwordHasher.HashPassword("Admin@123"),
                    RoleName = "Admin",
                    IsActive = true,
                    IsEmailVerified = true,
                    CreatedAt = DateTime.UtcNow
                };

                dbContext.Users.Add(adminUser);
                await dbContext.SaveChangesAsync();
            }
        }
    }
}