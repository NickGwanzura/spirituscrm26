#!/bin/bash

echo "Setting up Vercel environment variables..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Check if logged in
echo "Checking Vercel login..."
vercel whoami || (echo "Please login first:" && vercel login)

# Link project if not already linked
if [ ! -d .vercel ]; then
    echo "Linking project..."
    vercel link
fi

echo ""
echo "Adding environment variables..."
echo ""

# Add DATABASE_URL
echo "Adding DATABASE_URL..."
echo "postgresql://neondb_owner:npg_fAQx6D4qZrbe@ep-hidden-poetry-adf43dz8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" | vercel env add DATABASE_URL production

# Generate and add JWT_SECRET
echo ""
echo "Generating JWT_SECRET..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo "Generated: $JWT_SECRET"
echo "$JWT_SECRET" | vercel env add JWT_SECRET production

echo ""
echo "✅ Environment variables added!"
echo ""
echo "Now add your GEMINI_API_KEY manually via the dashboard or run:"
echo "  echo 'your-gemini-key' | vercel env add GEMINI_API_KEY production"
echo ""
echo "Then deploy with: vercel --prod"
