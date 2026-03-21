using System.ComponentModel.DataAnnotations;

namespace CapShop.AdminService.DTOs
{
    public class AdminUpdateStockDto
    {
        [Range(0, 100000)]
        public int Stock { get; set; }
    }
}