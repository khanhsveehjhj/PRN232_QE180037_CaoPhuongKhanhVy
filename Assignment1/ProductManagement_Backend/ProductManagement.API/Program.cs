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
var corsOriginsFromEnv = Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS");
var allowedOrigins = !string.IsNullOrEmpty(corsOriginsFromEnv)
    ? corsOriginsFromEnv.Split(',', StringSplitOptions.RemoveEmptyEntries)
    : builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
      ?? new string[] { "http://localhost:3000", "https://prn-232-qe-180037-cao-phuong-khanh.vercel.app" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });

    // Alternative policy for development that allows all origins
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Product Management API",
        Version = "v1",
        Description = "API for managing products with image upload functionality",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Product Management Team",
            Email = "support@productmanagement.com"
        }
    });
});

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
// Enable Swagger in all environments for API documentation
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Product Management API V1");
    c.RoutePrefix = "swagger";
    c.DisplayRequestDuration();
});

if (app.Environment.IsDevelopment())
{
    // Additional development-specific configurations can go here
}

app.UseHttpsRedirection();

// Use CORS - Use AllowFrontend for production, AllowAll for development if needed
app.UseCors(app.Environment.IsDevelopment() ? "AllowAll" : "AllowFrontend");

// Map controller endpoints
app.MapControllers();

app.Run();