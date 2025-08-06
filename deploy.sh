#!/bin/bash

echo "🚀 Deploying Yegna Bingo to Vercel..."

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy web UI
echo "🌐 Deploying Web UI..."
cd web-ui
vercel --prod --yes

# Get the deployment URL
DEPLOY_URL=$(vercel ls | grep "yegna-bingo" | head -1 | awk '{print $2}')

echo "✅ Web UI deployed to: $DEPLOY_URL"

# Update bot configuration
echo "🤖 Updating bot configuration..."
cd ../bot
sed -i "s|http://localhost:3000|$DEPLOY_URL|g" config.js

echo "🎉 Deployment complete!"
echo "📱 Your bot will now open the web UI directly in Telegram!"
echo "🔗 Web UI URL: $DEPLOY_URL" 