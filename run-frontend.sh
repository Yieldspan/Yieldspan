#!/bin/bash

# Yieldspan Frontend Runner
echo "🎨 Starting Yieldspan Frontend..."

# Install dependencies if needed
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "🚀 Starting Development Server..."
npm run dev 