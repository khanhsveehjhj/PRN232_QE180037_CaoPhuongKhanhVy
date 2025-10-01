using Microsoft.AspNetCore.Http;

namespace ProductManagement.Service
{
    public interface IImageUploadService
    {
        Task<string> UploadImageAsync(IFormFile file);
        Task<bool> DeleteImageAsync(string publicId);
        string GetImageUrl(string publicId);
    }
}