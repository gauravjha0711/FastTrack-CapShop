using System.ComponentModel.DataAnnotations;

namespace CapShop.AdminService.DTOs
{
    public class AdminCreateProductDto
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

        public int CategoryId { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsFeatured { get; set; }
    }
}