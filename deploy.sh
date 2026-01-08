#!/bin/bash

echo "🚀 FRONTEND UAT DEPLOY STARTED: $(date)"

cd /var/www/frontend-uat-admin || exit 1

echo "🧹 Resetting local changes..."
git fetch origin
git reset --hard origin/testing
git clean -fd

echo "📦 Installing dependencies..."
npm install --silent

echo "🏗️ Building frontend..."
npm run build

echo "🔁 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ FRONTEND UAT DEPLOY COMPLETED"
