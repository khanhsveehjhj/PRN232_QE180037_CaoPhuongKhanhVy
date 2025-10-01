using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ProductManagement.Data
{
    public class UpdateProductRequestDto
    {
        [Required(ErrorMessage = "Product name is required")]
        [StringLength(100, ErrorMessage = "Product name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Product description is required")]
        [StringLength(500, ErrorMessage = "Product description cannot exceed 500 characters")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Product price is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }

        [Url(ErrorMessage = "Invalid URL format")]
        public string? ImageUrl { get; set; }

        public IFormFile? ImageFile { get; set; }

        public bool RemoveImage { get; set; } = false;
    }
}