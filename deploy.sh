#!/bin/bash

echo "🚀 FRONTEND DEPLOY STARTED at $(date)"

cd /var/www/frontend-uat-admin || exit 1

echo "📦 Pulling latest code..."
git pull origin testing

echo "📦 Installing dependencies..."
npm install --silent

echo "🏗️ Building frontend..."
npm run build

echo "🔁 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ FRONTEND DEPLOY COMPLETED"
