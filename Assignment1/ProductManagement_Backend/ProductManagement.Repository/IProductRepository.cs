using ProductManagement.Data;

namespace ProductManagement.Repository
{
    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetAllProductsAsync(CancellationToken cancellationToken = default);
        Task<Product?> GetProductByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<Product> CreateProductAsync(Product product, CancellationToken cancellationToken = default);
        Task<Product> UpdateProductAsync(Product product, CancellationToken cancellationToken = default);
        Task<bool> DeleteProductAsync(int id, CancellationToken cancellationToken = default);
    }
}