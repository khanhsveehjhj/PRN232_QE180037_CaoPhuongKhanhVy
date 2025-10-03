#!/bin/bash

# ProductManagement Deployment Script

echo "🚀 Starting ProductManagement deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please update the .env file with your actual configuration values before deploying."
    echo "   Required values:"
    echo "   - CLOUDINARY_CLOUD_NAME"
    echo "   - CLOUDINARY_API_KEY"
    echo "   - CLOUDINARY_API_SECRET"
    read -p "Press enter to continue after updating .env file..."
fi

# Build and start the containers
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting containers..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec api dotnet ef database update --project ProductManagement.Data

echo "✅ Deployment completed!"
echo ""
echo "🌐 Your application is now running at:"
echo "   API: http://localhost:8080"
echo "   Swagger UI: http://localhost:8080/swagger"
echo ""
echo "📊 To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop the application:"
echo "   docker-compose down"