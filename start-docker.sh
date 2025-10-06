#!/bin/bash

# Docker startup script for The Tribe Discord Bot

echo "🐳 Starting The Tribe Discord Bot in Docker..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please create one with your Discord bot credentials."
    exit 1
fi

# Build and start the containers
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting containers..."
echo "ℹ️  Commands will be automatically deployed when the bot starts..."
docker-compose up -d

echo "📊 Checking container status..."
docker-compose ps

echo "📝 To view logs, run: docker-compose logs -f discord-bot"
echo "🛑 To stop the bot, run: docker-compose down"
echo "🔄 To restart the bot, run: docker-compose restart discord-bot"