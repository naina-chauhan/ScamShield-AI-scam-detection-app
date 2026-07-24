# 🎉 Setup Complete! Ab Project Run Karo

Main ne sab setup kar diya hai! Ab sirf 3 steps baaki hain:

---

## ✅ Already Done (By Me):
- ✅ Backend dependencies installed (422 packages)
- ✅ Frontend dependencies installed (254 packages)
- ✅ Backend .env file created
- ✅ Frontend .env file created
- ✅ All code files ready

---

## 🚀 Ab Aapko Ye 3 Cheezein Karni Hain:

### Step 1️⃣: Get FREE API Key (2 minutes)

**Option A: Groq (Recommended - Sabse Fast!)**
1. Open: https://console.groq.com
2. Sign up with Google/Email
3. Click "API Keys"
4. Click "Create API Key"
5. Copy the key (starts with `gsk_...`)

**Option B: Google Gemini (Bhi Free!)**
1. Open: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

**Option C: Ollama (100% Free, Local - No signup!)**
1. Download: https://ollama.ai/download
2. Install it
3. Run in terminal: `ollama pull llama3`
4. Run: `ollama serve`
5. No API key needed!

---

### Step 2️⃣: Add API Key to .env File

**Open this file:** `backend/.env`

**Find this line:**
```env
GROQ_API_KEY=your-groq-api-key-here
```

**Replace with your actual key:**
```env
GROQ_API_KEY=gsk_abc123xyz...your-real-key
```

**If using Gemini instead:**
```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key-here
```

**If using Ollama (no key needed):**
```env
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
```

**Save the file!** ✅

---

### Step 3️⃣: Start MongoDB (Choose ONE)

**Option A: Docker (Easiest!)**
```powershell
docker run -d -p 27017:27017 --name mongodb mongo
```

**Option B: Local MongoDB**
```powershell
net start MongoDB
```

**Option C: MongoDB Atlas (Cloud - Free)**
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster
4. Get connection string
5. Update `MONGODB_URI` in `backend/.env`

**Verify MongoDB is running:**
```powershell
mongosh --eval "db.version()"
```

---

## 🎯 Run the Project!

### Terminal 1 - Backend:
```powershell
cd ScamShield-AI-scam-detection-app-main/backend
npm run dev
```

**Wait for this message:**
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
✅ ScamShield AI Backend Ready!
```

### Terminal 2 - Frontend (New Window):
```powershell
cd ScamShield-AI-scam-detection-app-main/frontend
npm run dev
```

**Wait for:**
```
➜ Local:   http://localhost:5173/
```

### Open Browser:
```
http://localhost:5173
```

---

## 🧪 Test It!

1. **Register** - Create account
2. **Try this scam message:**
   ```
   URGENT! You won $1,000,000 lottery! 
   Share your OTP now to claim prize.
   Click: http://bit.ly/fake-scam
   ```
3. **See Result** - Should detect as SCAM! 🎉

---

## ❌ Troubleshooting

### Problem: MongoDB not connecting

**Error:** `MongoNetworkError`

**Fix:**
```powershell
# Start MongoDB
docker run -d -p 27017:27017 mongo

# OR
net start MongoDB

# Verify
mongosh
```

### Problem: API Key Invalid

**Fix:**
1. Check API key has no spaces
2. Make sure `AI_PROVIDER=groq` matches your key
3. Restart backend after changing .env

### Problem: Port 5000 in use

**Fix:**
```powershell
# Check what's using port 5000
netstat -ano | findstr :5000

# Change port in backend/.env
PORT=5001
```

---

## 📚 Documentation Files:

- **`RUN_PROJECT.md`** - Detailed guide
- **`QUICK_START.md`** - Quick reference
- **`API_TESTING.md`** - Test APIs
- **`FEATURES_CHECKLIST.md`** - All features

---

## 🎁 Free API Options Summary:

| Provider | Speed | Signup | API Key | Best For |
|----------|-------|--------|---------|----------|
| **Groq** ⭐ | Fastest | Easy | Free | Recommended |
| **Gemini** | Fast | Google | Free | Great alternative |
| **Ollama** | Good | None | None | Offline work |
| **Hugging Face** | Slow | Easy | Free | Backup option |

---

## ✅ Final Checklist:

- [ ] Got API key from Groq/Gemini/Ollama
- [ ] Added key to `backend/.env`
- [ ] MongoDB is running
- [ ] Backend started (npm run dev)
- [ ] Frontend started (npm run dev)
- [ ] Browser opened at localhost:5173
- [ ] Tested scam detection

---

## 🆘 Need Help?

**Check logs in terminal for errors!**

Common issues:
1. Forgot to add API key → Edit `backend/.env`
2. MongoDB not running → Start it
3. Wrong AI_PROVIDER → Must match your key type

---

**Everything is ready! Just add your FREE API key and run! 🚀**

**Status**: ✅ 95% Complete
**Time to run**: 5 minutes
**Cost**: $0 (100% FREE with Groq/Gemini/Ollama)
