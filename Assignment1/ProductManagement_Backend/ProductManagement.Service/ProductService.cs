using ProductManagement.Data;
using ProductManagement.Repository;

namespace ProductManagement.Service
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repository;

        public ProductService(IProductRepository repository)
        {
            _repository = repository;
        }

        public async Task<Product> CreateProductAsync(Product product, CancellationToken cancellationToken = default)
        {
            return await _repository.CreateProductAsync(product, cancellationToken);
        }

        public async Task<bool> DeleteProductAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _repository.DeleteProductAsync(id, cancellationToken);
        }

        public async Task<IEnumerable<Product>> GetAllProductsAsync(CancellationToken cancellationToken = default)
        {
            return await _repository.GetAllProductsAsync(cancellationToken);
        }

        public async Task<Product?> GetProductByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _repository.GetProductByIdAsync(id, cancellationToken);
        }

        public async Task<Product> UpdateProductAsync(Product product, CancellationToken cancellationToken = default)
        {
            return await _repository.UpdateProductAsync(product, cancellationToken);
        }
    }
}