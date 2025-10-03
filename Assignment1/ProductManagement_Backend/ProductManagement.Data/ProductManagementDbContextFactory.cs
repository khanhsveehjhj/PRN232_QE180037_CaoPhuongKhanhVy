using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using DotNetEnv;

namespace ProductManagement.Data
{
    public class ProductManagementDbContextFactory : IDesignTimeDbContextFactory<ProductManagementDbContext>
    {
        public ProductManagementDbContext CreateDbContext(string[] args)
        {
            // Load environment variables from .env file
            try
            {
                // Try to load from parent directory (where .env is located)
                var envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", ".env");
                if (File.Exists(envPath))
                {
                    Env.Load(envPath);
                }
                else
                {
                    // Try current directory
                    Env.Load();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to load .env file: {ex.Message}");
            }

            var optionsBuilder = new DbContextOptionsBuilder<ProductManagementDbContext>();

            // Get connection string from environment variable or use a default
            var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING");

            // If no environment variable or connection fails, use local PostgreSQL
            if (string.IsNullOrEmpty(connectionString))
            {
                connectionString = "Host=localhost;Database=productmanagement;Username=postgres;Password=123";
            }

            optionsBuilder.UseNpgsql(connectionString, b => b.MigrationsAssembly("ProductManagement.Data"));

            return new ProductManagementDbContext(optionsBuilder.Options);
        }
    }
}