using Microsoft.EntityFrameworkCore;
using ProductManagement.Data;

namespace ProductManagement.Repository
{
    public class ProductRepository : IProductRepository
    {
        private readonly ProductManagementDbContext _context;

        public ProductRepository(ProductManagementDbContext context)
        {
            _context = context;
        }

        public async Task<Product> CreateProductAsync(Product product, CancellationToken cancellationToken = default)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync(cancellationToken);
            return product;
        }

        public async Task<bool> DeleteProductAsync(int id, CancellationToken cancellationToken = default)
        {
            var product = await _context.Products.FindAsync(new object[] { id }, cancellationToken);
            if (product == null) return false;

            _context.Products.Remove(product);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Products
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        public async Task<Product?> GetProductByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Products
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        }

        public async Task<Product> UpdateProductAsync(Product product, CancellationToken cancellationToken = default)
        {
            // Tìm product hiện tại trong database
            var existingProduct = await _context.Products.FindAsync(new object[] { product.Id }, cancellationToken);

            if (existingProduct == null)
            {
                throw new ArgumentException($"Product with ID {product.Id} not found", nameof(product));
            }

            // Chỉ update các field cần thiết, giữ nguyên ID
            existingProduct.Name = product.Name;
            existingProduct.Description = product.Description;
            existingProduct.Price = product.Price;
            existingProduct.Image = product.Image;

            await _context.SaveChangesAsync(cancellationToken);
            return existingProduct;
        }
    }
}
