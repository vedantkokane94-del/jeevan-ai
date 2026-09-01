# 🚀 JEEVAN AI — Quick Deployment Setup

## Current Status
- ✅ Code: All functions working
- ✅ Development Server: Running on http://localhost:3000
- ⏳ GitHub: Ready to push (needs repository verification)
- ⏳ Production: Ready for Vercel + Render deployment

---

## 🎯 3-Step Production Deployment

### **Step 1: Verify GitHub Repository (5 minutes)**

**Issue:** Cannot push due to permission denied (403)

**Solutions:**

#### A. Create New Repository (if it doesn't exist)
```bash
# Visit GitHub and create new repo at:
# https://github.com/new
# Name: jeevan-ai
# Make it PUBLIC

# Then update local repo:
cd c:\jeevan-ai-main
git remote set-url origin https://github.com/vedantkokane94-del/jeevan-ai.git

# Try pushing again:
git push -u origin main
```

#### B. Generate New PAT Token (if existing one is invalid)
```
1. Go to: https://github.com/settings/tokens/new
2. Token name: "GitHub Desktop"
3. Expiration: 90 days
4. Scopes: 
   ✓ repo (full control of private repositories)
   ✓ read:user
   ✓ user:email
5. Copy token and use in: git push
```

#### C. Use SSH (No passwords needed)
```bash
# Generate SSH key:
ssh-keygen -t ed25519 -C "vedantkokane94@gmail.com"

# Add to GitHub: https://github.com/settings/keys

# Update remote:
git remote set-url origin git@github.com:vedantkokane94-del/jeevan-ai.git

# Push:
git push -u origin main
```

---

### **Step 2: Deploy Frontend to Vercel (10 minutes)**

Vercel is the easiest way to deploy Next.js apps.

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to web app
cd c:\jeevan-ai-main\apps\web

# Deploy
vercel deploy --prod
```

**During deployment setup:**
- Project name: `jeevan-ai` (or your preference)
- Framework preset: Next.js
- Root directory: `apps/web` (it may auto-detect)
- Environment variables:
  ```
  NEXT_PUBLIC_API_URL = https://jeevan-api.onrender.com/api/v1
  NEXT_PUBLIC_WS_URL = wss://jeevan-api.onrender.com/api/v1
  ```

**Result:** Your site will be at `https://<project-name>.vercel.app`

---

### **Step 3: Deploy Backend to Render (10 minutes)**

Render provides free PostgreSQL + Docker hosting.

#### Option A: Automatic via GitHub (Recommended)
1. Go to https://render.com
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Fill in:
   - **Name:** `jeevan-api`
   - **Runtime:** `Docker`
   - **Build command:** `cd services/api && pip install -r requirements.txt`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port 8000`
   - **Region:** Singapore
   - **Plan:** Free
6. Add environment variables:
   ```
   DATABASE_URL = <copy from Render PostgreSQL connection>
   REDIS_URL = <copy from Render Redis connection>
   JWT_SECRET = <generate random string>
   ```

#### Option B: Manual Docker Deployment
```bash
# Build locally
cd c:\jeevan-ai-main\services\api
docker build -f Dockerfile -t jeevan-api .

# Test locally
docker run -p 8000:8000 jeevan-api

# Visit: http://localhost:8000/api/docs
```

---

## ✅ Verify Everything Works

After all deployments:

```bash
# Test Frontend
curl https://your-vercel-project.vercel.app

# Test Backend
curl https://jeevan-api.onrender.com/api/v1/health

# Test Authentication
curl -X POST https://jeevan-api.onrender.com/api/v1/auth/token \
  -d "username=test@example.com&password=test123"

# Test WebSocket (from your app)
# Should connect to wss://jeevan-api.onrender.com/api/v1/ws/incidents
```

---

## 🔐 Environment Variables Checklist

### Frontend (.env.production)
- [ ] `NEXT_PUBLIC_API_URL` = Production backend URL
- [ ] `NEXT_PUBLIC_WS_URL` = Production WebSocket URL

### Backend (Render)
- [ ] `DATABASE_URL` = PostgreSQL connection string
- [ ] `REDIS_URL` = Redis connection string
- [ ] `JWT_SECRET` = Random 32+ character string
- [ ] `API_CORS_ORIGINS` = https://your-vercel-domain.vercel.app
- [ ] `ENVIRONMENT` = production

---

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Internet (HTTPS)                      │
└────────────┬─────────────────────────────────────────────┘
             │
    ┌────────┴─────────┐
    │                  │
    ▼                  ▼
┌─────────────┐   ┌──────────────┐
│   Vercel    │   │   Render     │
│ (Frontend)  │   │  (Backend)   │
│ Next.js App │   │  FastAPI API │
│ localhost:3000  │ :8000        │
└─────┬───────┘   └──┬───────────┘
      │              │
      └──────┬───────┘
             │
      ┌──────┴────────┐
      │               │
      ▼               ▼
┌───────────┐  ┌──────────────┐
│PostgreSQL │  │    Redis     │
│ + PostGIS │  │   (Cache)    │
└───────────┘  └──────────────┘
```

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| **GitHub 403 Permission Denied** | Create new PAT token or new repo |
| **Vercel build fails** | Check `next.config.ts`, verify dependencies |
| **API connection timeout** | Verify `NEXT_PUBLIC_API_URL` is correct, check CORS |
| **Database migration fails** | Run `alembic upgrade head` in Render shell |
| **WebSocket not connecting** | Use `wss://` protocol, check origin headers |
| **Image not loading** | Add image domain to `next.config.ts` |

---

## 📊 Expected Results

After completing all steps:

| Component | Status | URL |
|-----------|--------|-----|
| Frontend | ✅ Live | `https://jeevan-ai.vercel.app` |
| API | ✅ Live | `https://jeevan-api.onrender.com` |
| Database | ✅ Live | Render PostgreSQL |
| Cache | ✅ Live | Render Redis |
| CI/CD | ✅ Automated | GitHub Actions |

---

## 🚀 Next: Iterate & Scale

Once deployed:

1. **Monitor:** Check Vercel & Render dashboards
2. **Logs:** View live logs in Render dashboard
3. **Scale:** Upgrade to paid tiers if needed
4. **Domain:** Add custom domain (optional)
5. **CDN:** Vercel includes free Vercel Edge Network
6. **Analytics:** Enable analytics in Vercel dashboard

---

## 📞 Support

- **Vercel Issues:** https://vercel.com/support
- **Render Issues:** https://render.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com

---

**You're just a few clicks away from production! 🎉**
