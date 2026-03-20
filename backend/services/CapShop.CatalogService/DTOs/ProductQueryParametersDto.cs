namespace CapShop.CatalogService.DTOs
{
    public class ProductQueryParametersDto
    {
        public string? Search { get; set; }
        public int? CategoryId { get; set; }
        public string? SortBy { get; set; } = "latest";
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 6;
    }
}