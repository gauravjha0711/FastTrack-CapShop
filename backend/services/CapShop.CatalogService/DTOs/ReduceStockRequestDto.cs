using System.ComponentModel.DataAnnotations;

namespace CapShop.CatalogService.DTOs
{
    public class ReduceStockRequestDto
    {
        [Range(1, 1000)]
        public int Quantity { get; set; }
    }
}