namespace CapShop.CatalogService.DTOs
{
    public class ProductListResponseDto
    {
        public IEnumerable<object> Items { get; set; } = new List<object>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}