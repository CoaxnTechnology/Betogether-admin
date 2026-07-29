#!/bin/bash

echo "🚀 FRONTEND PROD DEPLOY STARTED: $(date)"

cd /var/www/frontend-prod-admin || exit 1

echo "📦 Fetching latest code..."
git fetch origin

echo "🔁 Resetting to origin/main (SAFE)"
git reset --hard origin/main

# ❗ NO git clean here (safe for prod)
# git clean -fd  ❌ NOT for production

echo "📦 Installing dependencies..."
npm install --silent

echo "🏗️ Building frontend..."
npm run build

echo "🔁 Reloading nginx..."
sudo systemctl reload nginx

echo "✅ FRONTEND PROD DEPLOY COMPLETED"
