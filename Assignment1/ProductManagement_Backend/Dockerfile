# Use the official .NET 8.0 SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory
WORKDIR /app

# Copy the solution file
COPY ProductManagement.sln ./

# Copy all project files
COPY ProductManagement.API/*.csproj ./ProductManagement.API/
COPY ProductManagement.Data/*.csproj ./ProductManagement.Data/
COPY ProductManagement.Repository/*.csproj ./ProductManagement.Repository/
COPY ProductManagement.Service/*.csproj ./ProductManagement.Service/

# Restore dependencies
RUN dotnet restore

# Copy the rest of the source code
COPY . .

# Build the application
RUN dotnet build ProductManagement.API/ProductManagement.API.csproj -c Release -o /app/build

# Publish the application
RUN dotnet publish ProductManagement.API/ProductManagement.API.csproj -c Release -o /app/publish

# Use the official .NET 8.0 runtime image for the final stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Set the working directory
WORKDIR /app

# Copy the published application from the build stage
COPY --from=build /app/publish .

# Expose the port the app runs on
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Create a non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Set the entry point
ENTRYPOINT ["dotnet", "ProductManagement.API.dll"]