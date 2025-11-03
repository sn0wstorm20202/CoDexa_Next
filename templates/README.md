# CoDexa Full-Stack Templates

## Overview

This directory contains templates for generating full-stack applications with React frontends and Express backends.

## Structure

```
templates/
├── backend/               # Express + Prisma backend template
│   ├── src/
│   │   ├── server.js      # Main Express server
│   │   ├── routes/        # API route handlers
│   │   ├── controllers/   # Business logic
│   │   └── middleware/    # Error handling, validation
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── package.json
│   └── .env.template
│
├── frontend/              # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── App.jsx        # Main component
│   │   ├── lib/
│   │   │   └── api.js     # API client with Axios
│   │   └── index.css      # Tailwind styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.template
│
├── process-manager.js     # Multi-process orchestration
├── startup.sh             # E2B sandbox initialization
├── e2b-template.json      # E2B configuration
└── README.md              # This file
```

## Quick Start (Local Testing)

### 1. Test Backend
```bash
cd templates/backend
npm install
npm run dev
# Backend runs on http://localhost:8000
# Health check: curl http://localhost:8000/health
```

### 2. Test Frontend
```bash
cd templates/frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
# Opens in browser automatically
```

### 3. Test Full Stack
```bash
cd templates
node process-manager.js
# Starts both frontend (3000) and backend (8000)
# Logs from both processes streamed to console
```

## Usage in E2B Sandbox

### Templates Location
Templates should be copied to `/templates/` in the E2B sandbox during build.

### Startup Process
```bash
# Run startup script
bash /home/user/startup.sh

# This will:
# 1. Copy templates to /home/user/frontend and /home/user/backend
# 2. Install dependencies (npm install)
# 3. Initialize database (if Prisma schema exists)
# 4. Start process manager
# 5. Both servers accessible via E2B URLs
```

### AI Agent Usage

The AI agent uses these tools to generate full-stack apps:

1. **setupFullStackProject()** - Copy templates to sandbox
2. **initializeDatabase()** - Create database schema
3. **generateBackendAPI()** - Create REST API endpoints
4. **connectFrontendToBackend()** - Configure API connection
5. **testEndpoints()** - Verify all APIs work

## Architecture Decision

The AI automatically detects if backend is needed:

- **Frontend Only**: Landing pages, portfolios, static sites
- **Full-Stack + SQLite**: Todo apps, blogs, simple dashboards
- **Full-Stack + PostgreSQL**: E-commerce, social networks, complex apps

## Environment Variables

### Backend (.env)
```env
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"  # SQLite
# DATABASE_URL="postgresql://..." # PostgreSQL
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## API Client Usage (Frontend)

```javascript
import { api } from './lib/api'

// Health check
const health = await api.checkHealth()

// CRUD operations
const users = await api.getAll('users')
const user = await api.getById('users', '123')
const newUser = await api.create('users', { name: 'John' })
const updated = await api.update('users', '123', { name: 'Jane' })
await api.delete('users', '123')
```

## Process Manager

Manages frontend and backend processes:

```javascript
import ProcessManager from './process-manager.js'

const manager = new ProcessManager()
await manager.startAll()

// Get logs
manager.getLogs('frontend')
manager.getLogs('backend')

// Stop all
manager.stopAll()
```

## Database Setup (Prisma)

### 1. Define Schema
```prisma
// backend/prisma/schema.prisma
model User {
  id    String @id @default(uuid())
  email String @unique
  name  String
}
```

### 2. Generate & Migrate
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 3. Use in Code
```javascript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const users = await prisma.user.findMany()
```

## Ports

- **Frontend**: 3000
- **Backend**: 8000
- **PostgreSQL** (optional): 5432

## Health Checks

- Frontend: `http://localhost:3000` (Vite dev server)
- Backend: `http://localhost:8000/health` (JSON response)

## Troubleshooting

### Backend won't start
```bash
# Check port availability
lsof -i :8000

# Check logs
tail -f backend/logs/error.log
```

### Frontend won't start
```bash
# Check port availability
lsof -i :3000

# Clear cache
rm -rf node_modules/.vite
```

### Database issues
```bash
cd backend

# Reset database
rm -f prisma/dev.db
npx prisma db push

# Check schema
npx prisma studio
```

## Features

### Backend
- ✅ Express 4 with ES modules
- ✅ Prisma ORM (SQLite/PostgreSQL)
- ✅ CORS configured
- ✅ Security headers (Helmet)
- ✅ Compression middleware
- ✅ Error handling
- ✅ Request logging (Morgan)
- ✅ Health check endpoint
- ✅ Auto-restart on crash

### Frontend
- ✅ React 18 + Vite 5
- ✅ Tailwind CSS 3
- ✅ Hot Module Replacement
- ✅ Axios API client
- ✅ Environment variables
- ✅ Proxy to backend
- ✅ Error boundaries
- ✅ Loading states

### Process Manager
- ✅ Multi-process orchestration
- ✅ Health checks
- ✅ Auto-restart
- ✅ Log aggregation
- ✅ Graceful shutdown
- ✅ Status monitoring

## Performance

- **Backend startup**: ~2-3 seconds
- **Frontend startup**: ~3-5 seconds (Vite)
- **Total startup**: <10 seconds
- **Health check response**: <100ms
- **Hot reload**: <500ms

## Security

- CORS enabled (configurable origin)
- Helmet.js for security headers
- Input validation ready (express-validator)
- JWT support included (bcrypt + jsonwebtoken)
- Rate limiting support

## Next Steps

1. **Run Prisma migration**: `npm run db:migrate`
2. **Test API endpoints**: Use `curl` or Postman
3. **Build production**: `npm run build` (both projects)
4. **Deploy**: Copy `dist/` folders to server

## Resources

- [Express Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind Documentation](https://tailwindcss.com/)

## Support

For issues or questions:
- Check `/docs/PHASE1_FULLSTACK_IMPLEMENTATION.md`
- Review agent tools in `/src/inngest/fullstack-tools.ts`
- Test locally before E2B deployment

---

**Version**: 1.0.0  
**Last Updated**: Phase 1 Implementation Complete  
**Status**: ✅ Ready for E2B Integration
