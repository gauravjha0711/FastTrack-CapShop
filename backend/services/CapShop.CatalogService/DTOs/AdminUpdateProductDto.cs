using System.ComponentModel.DataAnnotations;

namespace CapShop.CatalogService.DTOs
{
    public class AdminUpdateProductDto
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Range(1, 100000)]
        public decimal Price { get; set; }

        [Range(0, 100000)]
        public int Stock { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsFeatured { get; set; }

        public bool IsActive { get; set; } = true;
    }
}