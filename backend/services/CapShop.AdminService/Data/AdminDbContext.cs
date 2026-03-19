using CapShop.AdminService.Models;
using Microsoft.EntityFrameworkCore;

namespace CapShop.AdminService.Data
{
    public class AdminDbContext : DbContext
    {
        public AdminDbContext(DbContextOptions<AdminDbContext> options) : base(options)
        {
        }

        public DbSet<DashboardSummary> DashboardSummaries { get; set; }
        public DbSet<SalesReport> SalesReports { get; set; }
    }
}