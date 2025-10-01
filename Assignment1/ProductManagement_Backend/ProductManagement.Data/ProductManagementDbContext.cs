using Microsoft.EntityFrameworkCore;

namespace ProductManagement.Data
{
    public class ProductManagementDbContext : DbContext
    {
        public ProductManagementDbContext(DbContextOptions<ProductManagementDbContext> options) : base(options)
        {

        }

        public DbSet<Product> Products { get; set; } = null!;
    }
}