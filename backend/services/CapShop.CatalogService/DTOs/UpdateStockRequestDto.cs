using System.ComponentModel.DataAnnotations;

namespace CapShop.CatalogService.DTOs
{
    public class UpdateStockRequestDto
    {
        [Range(0, 100000)]
        public int Stock { get; set; }
    }
}