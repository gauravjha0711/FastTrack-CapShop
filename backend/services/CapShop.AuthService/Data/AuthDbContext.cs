using CapShop.AuthService.Models;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace CapShop.AuthService.Data
{
    public class AuthDbContext : DbContext
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
    }
}