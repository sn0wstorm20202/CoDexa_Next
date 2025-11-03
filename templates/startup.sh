#!/bin/bash

echo "🚀 CoDexa Full-Stack Startup"
echo "=============================="
echo ""

# Check if frontend exists
if [ -d "/home/user/frontend" ]; then
  echo "📦 Installing frontend dependencies..."
  cd /home/user/frontend
  npm install --silent --no-progress 2>&1 | grep -v "npm WARN"
  
  # Create .env if template exists
  if [ -f ".env.template" ] && [ ! -f ".env" ]; then
    cp .env.template .env
    echo "✅ Created frontend .env"
  fi
  
  echo "✅ Frontend ready"
  echo ""
fi

# Check if backend exists
if [ -d "/home/user/backend" ]; then
  echo "📦 Installing backend dependencies..."
  cd /home/user/backend
  npm install --silent --no-progress 2>&1 | grep -v "npm WARN"
  
  # Create .env if template exists
  if [ -f ".env.template" ] && [ ! -f ".env" ]; then
    cp .env.template .env
    echo "✅ Created backend .env"
  fi
  
  # Check if Prisma schema exists
  if [ -f "prisma/schema.prisma" ]; then
    echo "🗄️  Setting up database..."
    
    # Generate Prisma client
    npx prisma generate --silent
    
    # Push schema to database (creates tables)
    npx prisma db push --skip-generate --accept-data-loss 2>&1 | grep -v "Prisma schema loaded"
    
    # Run seeds if they exist
    if [ -f "prisma/seed.js" ]; then
      node prisma/seed.js
    fi
    
    echo "✅ Database ready"
  fi
  
  echo "✅ Backend ready"
  echo ""
fi

# Start process manager
echo "🎬 Starting all processes..."
echo ""

cd /home/user
node process-manager.js
