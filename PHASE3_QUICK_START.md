# Phase 3 Quick Start Guide

## 🎯 What Changed

CoDexa now builds **real full-stack applications** with:
- ✅ Real Express backend servers (port 8000)
- ✅ Real Prisma databases (SQLite/PostgreSQL)  
- ✅ Real REST APIs
- ✅ React + Vite frontend (port 3000)
- ✅ Both URLs accessible

**No more localStorage simulation!**

---

## 🧪 How to Test

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test Full-Stack App Creation

Go to http://localhost:3000 and try these prompts:

#### Simple Todo App
```
Build a todo app with add, complete, and delete functionality
```

**Expected Result:**
- Architecture: `fullstack`
- Database: SQLite with `Todo` model
- Backend API: GET, POST, PUT, DELETE endpoints
- Frontend: Add form, todo list, delete buttons
- Two URLs provided: Frontend + Backend

#### Blog with Authentication
```
Build a blog app with user authentication and comments
```

**Expected Result:**
- Architecture: `fullstack`
- Database: PostgreSQL with `User`, `Post`, `Comment` models
- Backend API: Auth endpoints, post CRUD, comment CRUD
- Frontend: Login form, post editor, comment section
- Two URLs provided

---

## 🔍 Monitoring

### Check Inngest Logs
Watch for these key events:

1. **Requirement Analysis**
   ```
   🔍 [AGENT] Analyzing requirements for architecture...
   🎯 Architecture decision: fullstack
   ```

2. **Template Setup**
   ```
   ✅ Frontend template copied
   ✅ Backend template copied
   ✅ Process manager copied
   ```

3. **Database Initialization**
   ```
   ✅ Prisma schema written
   ✅ Prisma client generated
   ✅ Database schema pushed
   ```

4. **Server Startup**
   ```
   🚀 Backend server running on port 8000
   🚀 Frontend running on port 3000
   ```

5. **URL Retrieval**
   ```
   Frontend: https://xxx.e2b.dev
   Backend: https://yyy.e2b.dev
   ```

---

## 📊 Architecture Decision Logic

The AI automatically decides frontend-only vs full-stack:

### Frontend-Only (No Backend)
Triggers on:
- Landing pages, portfolios
- Static content sites
- Presentations, demos
- No data persistence needed

### Full-Stack (With Backend)
Triggers on:
- "todo app", "blog", "social media"
- "user login", "authentication"
- "save data", "database"
- "CRUD", "API"
- Any multi-user features

---

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite 5
- Tailwind CSS 3
- Axios (for API calls)

### Backend
- Node.js 20
- Express 4
- Prisma ORM
- CORS, Helmet, Compression

### Database
- SQLite (simple apps)
- PostgreSQL (complex apps)

---

## 📁 File Structure in Sandbox

```
/home/user/
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # ✅ AI-generated
│   │   ├── components/       # ✅ AI-generated
│   │   ├── lib/
│   │   │   └── api.js        # ✅ AI-generated API client
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/           # ✅ AI-generated
│   │   │   └── todos.js
│   │   └── controllers/      # ✅ AI-generated
│   │       └── todosController.js
│   ├── prisma/
│   │   ├── schema.prisma     # ✅ AI-generated
│   │   └── seed.js           # ✅ AI-generated (optional)
│   ├── package.json
│   └── dev.db                # ✅ Created by Prisma
│
└── process-manager.js
```

---

## 🔧 Troubleshooting

### Issue: Templates not found
**Solution:** Make sure Docker is running and E2B template is built, OR templates exist locally in `/templates/` directory

### Issue: Prisma commands fail
**Check:**
- Schema syntax is valid
- Database type matches configuration
- Prisma dependencies installed in template

### Issue: Backend server not starting
**Check:**
- Port 8000 is available
- Express dependencies installed
- No syntax errors in server.js

### Issue: Frontend can't reach backend
**Check:**
- CORS is configured in backend
- Vite proxy is set up correctly
- Both servers are running

---

## 🎓 Key Features

### 1. Automatic Architecture Detection
AI analyzes user prompt and decides frontend-only vs full-stack automatically.

### 2. Real Database Operations
Prisma ORM creates actual database tables and handles migrations.

### 3. RESTful APIs
Backend exposes proper REST endpoints following conventions:
- `GET /api/resource` - List all
- `GET /api/resource/:id` - Get one
- `POST /api/resource` - Create
- `PUT /api/resource/:id` - Update
- `DELETE /api/resource/:id` - Delete

### 4. Process Management
Both servers run simultaneously with:
- Auto-restart on crash
- Health checks
- Log aggregation

### 5. Dual URLs
User gets both frontend and backend URLs for complete access.

---

## 📝 Example: Todo App Flow

**User Input:** "Build a todo app"

**AI Actions:**
1. Analyzes requirement → Detects fullstack
2. Calls `setupFullStackProject()` → Copies templates
3. Calls `initializeDatabase()` → Creates Todo model
4. Calls `generateBackendAPI()` → Creates CRUD endpoints
5. Calls `createOrUpdateFiles()` → Builds React components
6. Calls `connectFrontendToBackend()` → Configures API connection
7. Process manager starts both servers
8. Returns both URLs to user

**Result:**
- Frontend: https://xxx.e2b.dev (React app)
- Backend: https://yyy.e2b.dev (API server)
- Database: SQLite with todos table

---

## 🚀 Production Deployment

For production, build the E2B template:

```bash
# 1. Start Docker Desktop

# 2. Build template
e2b template build --dockerfile e2b.Dockerfile --name codexa-fullstack-v2

# 3. Get template ID from output

# 4. Update src/inngest/function.ts:
const sandbox = await Sandbox.create("your-template-id");
```

This bakes templates into the E2B image for faster startup.

---

## 📖 Additional Resources

- **Full Details:** See `PHASE3_COMPLETION_SUMMARY.md`
- **Template Structure:** Check `/templates/` directory
- **E2B Docs:** https://e2b.dev/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

## ✅ Success Checklist

Before considering Phase 3 complete:

- [x] fullstack-tools.ts implements real backend
- [x] FULLSTACK_PROMPT updated for real backend
- [x] Backend URL retrieval enabled
- [ ] Manual test: Simple todo app
- [ ] Manual test: Complex blog app
- [ ] E2B template built (optional for testing)
- [ ] Production deployment (optional)

**Current Status: CODE COMPLETE, TESTING PENDING**

---

🎉 **You're ready to build real full-stack apps with CoDexa!**
