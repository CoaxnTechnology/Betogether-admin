#!/bin/bash
cd /var/www/testing/admin

git checkout testing
git pull origin testing

npm install
npm run build

sudo systemctl restart nginx
