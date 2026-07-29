#!/bin/bash

echo "🚀 FRONTEND UAT DEPLOY STARTED: $(date)"

cd /var/www/frontend-uat-admin || exit 1

echo "📦 Fetching latest code..."
git fetch origin

echo "🌿 Checking out testing branch..."
git checkout testing

echo "🔁 Resetting to origin/testing"
git reset --hard origin/testing

echo "📦 Installing dependencies..."
npm install --silent

echo "🏗️ Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "🔁 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ FRONTEND UAT DEPLOY COMPLETED"
