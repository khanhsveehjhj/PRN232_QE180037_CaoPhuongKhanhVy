using Microsoft.AspNetCore.Mvc;
using ProductManagement.Data;
using ProductManagement.Service;

namespace ProductManagement.API
{
    [ApiController]
    [Route("api/products")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _service;
        private readonly IImageUploadService _imageUploadService;

        public ProductController(IProductService service, IImageUploadService imageUploadService)
        {
            _service = service;
            _imageUploadService = imageUploadService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProducts(CancellationToken cancellationToken = default)
        {
            try
            {
                var products = await _service.GetAllProductsAsync(cancellationToken);
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var product = await _service.GetProductByIdAsync(id, cancellationToken);
                if (product == null)
                {
                    return NotFound($"Product with ID {id} not found");
                }
                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromForm] CreateProductRequestDto createDto, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                string imageUrl = string.Empty;

                // Ưu tiên ImageFile trước, sau đó mới đến ImageUrl
                if (createDto.ImageFile != null)
                {
                    imageUrl = await _imageUploadService.UploadImageAsync(createDto.ImageFile);
                }
                else if (!string.IsNullOrEmpty(createDto.ImageUrl))
                {
                    imageUrl = createDto.ImageUrl;
                }

                // Tạo Product object
                var product = new Product
                {
                    Name = createDto.Name,
                    Description = createDto.Description,
                    Price = createDto.Price,
                    Image = imageUrl
                };

                var createdProduct = await _service.CreateProductAsync(product, cancellationToken);
                return CreatedAtAction(nameof(GetProductById), new { id = createdProduct.Id }, createdProduct);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] UpdateProductRequestDto updateDto, CancellationToken cancellationToken = default)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Lấy product hiện tại để có thông tin ảnh cũ
                var existingProduct = await _service.GetProductByIdAsync(id, cancellationToken);
                if (existingProduct == null)
                {
                    return NotFound($"Product with ID {id} not found");
                }

                string imageUrl = existingProduct.Image ?? string.Empty;

                // Xử lý ảnh theo thứ tự ưu tiên
                if (updateDto.RemoveImage)
                {
                    // Người dùng muốn xóa ảnh
                    if (!string.IsNullOrEmpty(existingProduct.Image))
                    {
                        var oldPublicId = ExtractPublicIdFromUrl(existingProduct.Image);
                        if (!string.IsNullOrEmpty(oldPublicId))
                        {
                            await _imageUploadService.DeleteImageAsync(oldPublicId);
                        }
                    }
                    imageUrl = string.Empty;
                }
                else if (updateDto.ImageFile != null)
                {
                    // Upload ảnh mới từ file
                    imageUrl = await _imageUploadService.UploadImageAsync(updateDto.ImageFile);

                    // Xóa ảnh cũ nếu có
                    if (!string.IsNullOrEmpty(existingProduct.Image))
                    {
                        var oldPublicId = ExtractPublicIdFromUrl(existingProduct.Image);
                        if (!string.IsNullOrEmpty(oldPublicId))
                        {
                            await _imageUploadService.DeleteImageAsync(oldPublicId);
                        }
                    }
                }
                else if (!string.IsNullOrEmpty(updateDto.ImageUrl))
                {
                    // Sử dụng URL được cung cấp
                    imageUrl = updateDto.ImageUrl;

                    // Xóa ảnh cũ nếu khác URL mới
                    if (!string.IsNullOrEmpty(existingProduct.Image) && existingProduct.Image != updateDto.ImageUrl)
                    {
                        var oldPublicId = ExtractPublicIdFromUrl(existingProduct.Image);
                        if (!string.IsNullOrEmpty(oldPublicId))
                        {
                            await _imageUploadService.DeleteImageAsync(oldPublicId);
                        }
                    }
                }
                // Nếu không có gì được cung cấp, giữ nguyên ảnh hiện tại

                // Tạo Product object với dữ liệu mới
                var product = new Product
                {
                    Id = id,
                    Name = updateDto.Name,
                    Description = updateDto.Description,
                    Price = updateDto.Price,
                    Image = imageUrl
                };

                var updatedProduct = await _service.UpdateProductAsync(product, cancellationToken);
                return Ok(updatedProduct);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var deleted = await _service.DeleteProductAsync(id, cancellationToken);
                if (!deleted)
                {
                    return NotFound($"Product with ID {id} not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private string ExtractPublicIdFromUrl(string imageUrl)
        {
            try
            {
                // Extract public ID from Cloudinary URL
                // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
                var uri = new Uri(imageUrl);
                var segments = uri.Segments;

                if (segments.Length >= 3)
                {
                    var lastSegment = segments[segments.Length - 1];
                    // Remove file extension
                    var publicId = Path.GetFileNameWithoutExtension(lastSegment);
                    // Add folder prefix if exists
                    if (segments.Length >= 4 && segments[segments.Length - 2] != "upload/")
                    {
                        var folder = segments[segments.Length - 2].TrimEnd('/');
                        return $"{folder}/{publicId}";
                    }
                    return publicId;
                }
                return string.Empty;
            }
            catch
            {
                return string.Empty;
            }
        }
    }
}