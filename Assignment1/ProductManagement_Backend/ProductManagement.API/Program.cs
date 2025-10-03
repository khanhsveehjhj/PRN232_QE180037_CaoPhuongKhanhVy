using Microsoft.EntityFrameworkCore;
using ProductManagement.Data;
using ProductManagement.Repository;
using ProductManagement.Service;
using DotNetEnv;

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

var builder = WebApplication.CreateBuilder(args);

// Get connection string from environment variable
var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ProductManagementDbContext>(options =>
    options.UseNpgsql(connectionString, b => b.MigrationsAssembly("ProductManagement.Data")));

// Add services to the container.
builder.Services.AddControllers();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "http://localhost:3001",
            "https://localhost:7158",
            "https://prn-232-qe-180037-cao-phuong-khanh.vercel.app",
            "https://*.vercel.app") // Allow specific Vercel domain and all Vercel subdomains
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .SetIsOriginAllowedToAllowWildcardSubdomains();
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register repository and service dependencies
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();

// Configure Cloudinary from environment variables
builder.Services.Configure<CloudinarySettings>(options =>
{
    options.CloudName = Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME") ?? "";
    options.ApiKey = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY") ?? "";
    options.ApiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET") ?? "";
});

// Register Cloudinary service
builder.Services.AddScoped<IImageUploadService, CloudinaryService>();

var app = builder.Build();

// Auto-migrate database on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ProductManagementDbContext>();
    try
    {
        context.Database.Migrate();
        Console.WriteLine("Database migration completed successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database migration failed: {ex.Message}");
        // Log but don't crash the application
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use CORS
app.UseCors("AllowFrontend");

// Map controller endpoints
app.MapControllers();

app.Run();