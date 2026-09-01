# JEEVAN AI — Production Deployment Guide

## 📋 Current Status

✅ **Development**: Running on http://localhost:3000  
✅ **Code**: All functions working, Map component fixed  
⏳ **GitHub**: Ready to push (permission issue to resolve)  
⏳ **Production**: Ready for deployment

---

## 🚀 Step 1: GitHub Push (Verify Permissions)

The PAT token shows permission denied. Options:

### **Option A: Create New Repository**
1. Go to https://github.com/new
2. Create repository: `jeevan-ai`
3. Make it **PUBLIC** (if you want it open-source)
4. Copy the new repository URL
5. Run:
```bash
cd c:\jeevan-ai-main
git remote set-url origin https://github.com/vedantkokane94-del/jeevan-ai.git
git push -u origin main
```

### **Option B: Check Existing Repository**
1. Go to https://github.com/vedantkokane94-del
2. Check if `jeevan-ai` repository exists
3. If it exists but you can't access it, you may need to:
   - Create a new PAT token at https://github.com/settings/tokens
   - Select scopes: `repo`, `read:user`, `user:email`
   - Retry push

### **Option C: Use SSH Instead**
1. Generate SSH key: `ssh-keygen -t ed25519 -C "vedantkokane94@gmail.com"`
2. Add public key to https://github.com/settings/keys
3. Update remote: `git remote set-url origin git@github.com:vedantkokane94-del/jeevan-ai.git`
4. Push: `git push -u origin main`

---

## 🌐 Step 2: Deploy Frontend (Vercel)

### **Fastest Option - Vercel (Recommended for Next.js)**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd c:\jeevan-ai-main\apps\web
vercel deploy --prod
```

3. **Set Environment Variables:**
```
NEXT_PUBLIC_API_URL = https://jeevan-api.onrender.com/api/v1
NEXT_PUBLIC_WS_URL = wss://jeevan-api.onrender.com/api/v1
```

4. **Your site will be live at:** `https://<your-project>.vercel.app`

---

## 🛠️ Step 3: Deploy Backend (Render or Docker)

### **Option A: Render (Free Tier)**

1. Go to https://render.com
2. Connect GitHub repository
3. Authorize Render to access your repo
4. Click "New +" → "Web Service"
5. Select your repository
6. Use settings from `render.yaml`:
   - **Name:** jeevan-api
   - **Runtime:** Docker
   - **Region:** Singapore
   - **Build:** `docker build -f services/api/Dockerfile .`
   - **Start:** `uvicorn app.main:app --host 0.0.0.0 --port 8000`

7. Set environment variables:
```
DATABASE_URL = postgres://user:pass@host/jeevan_ai
REDIS_URL = redis://...
JWT_SECRET = <generate-random-secret>
NEXT_PUBLIC_API_URL = https://jeevan-api.onrender.com/api/v1
```

8. **Backend URL:** `https://jeevan-api.onrender.com`

### **Option B: Docker Desktop (Local Testing)**

```bash
cd c:\jeevan-ai-main\services\api
docker build -f Dockerfile -t jeevan-api .
docker run -p 8000:8000 jeevan-api
```

Visit: http://localhost:8000/api/docs

---

## 🗄️ Step 4: Database Setup

### **PostgreSQL with PostGIS**

**Render provides PostgreSQL, but PostGIS needs custom setup:**

1. Connect to Render PostgreSQL
2. Run migrations:
```bash
cd services/api
alembic upgrade head
```

3. Enable PostGIS extension (if available):
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## 📝 Step 5: Environment Configuration

### **Development (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1
```

### **Production (.env.production)**
```
NEXT_PUBLIC_API_URL=https://jeevan-api.onrender.com/api/v1
NEXT_PUBLIC_WS_URL=wss://jeevan-api.onrender.com/api/v1
JWT_SECRET=<your-secret>
DATABASE_URL=<render-database-url>
REDIS_URL=<render-redis-url>
```

---

## ✅ Deployment Checklist

- [ ] GitHub repository created and code pushed
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] PostgreSQL database configured
- [ ] Redis cache configured
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] API endpoints tested
- [ ] Frontend-Backend connection verified
- [ ] HTTPS/SSL enabled
- [ ] Domain configured (optional)

---

## 🔗 Important Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com
- **GitHub:** https://github.com/vedantkokane94-del
- **Your Frontend:** https://<your-vercel-domain>.vercel.app
- **Your API:** https://jeevan-api.onrender.com
- **API Docs:** https://jeevan-api.onrender.com/api/docs

---

## 🐛 Troubleshooting

### Build Fails on Vercel
- Check `next.config.ts` for Turbopack compatibility
- Verify all dependencies are installed
- Check `.gitignore` doesn't exclude necessary files

### API Connection Fails
- Verify `NEXT_PUBLIC_API_URL` is correctly set
- Check CORS settings in FastAPI (`core/config.py`)
- Ensure backend service is running

### Database Issues
- Run `alembic upgrade head` to apply migrations
- Check PostgreSQL connection string
- Verify PostGIS extension is enabled

### WebSocket Connection Fails
- Use `wss://` (secure WebSocket) for production
- Ensure both frontend and backend use same origin
- Check Render firewall settings

---

## 🚀 Quick Deploy Commands

```bash
# Push to GitHub
cd c:\jeevan-ai-main
git add .
git commit -m "Ready for production deployment"
git push origin main

# Deploy Frontend to Vercel
cd apps/web
vercel deploy --prod

# Deploy Backend to Render
# (Connect GitHub repository via Render Dashboard)
```

---

## 📞 Next Steps

1. **Verify/Create GitHub Repository** - Fix permission issue
2. **Deploy to Vercel** - Frontend in minutes
3. **Deploy to Render** - Backend with database
4. **Connect Services** - Test API integration
5. **Enable Custom Domain** - Optional but recommended

Your JEEVAN AI platform will be production-ready! 🎉
