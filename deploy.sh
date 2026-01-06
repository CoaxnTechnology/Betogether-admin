#!/bin/bash
echo "🚀 ADMIN DEPLOY STARTED"

git checkout testing
git pull origin testing

npm install
npm run build

pm2 restart uat-api
echo "✅ ADMIN DEPLOY FINISHED"
