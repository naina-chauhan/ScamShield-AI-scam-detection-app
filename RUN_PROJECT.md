# 🚀 Run ScamShield AI Project

Follow these exact steps to run the project. Bilkul simple hai! 🎯

## ✅ Prerequisites Check

Before starting, make sure you have:

1. **Node.js installed** (check: `node --version` should show 18+)
2. **MongoDB installed** OR Docker OR MongoDB Atlas account
3. **Free API key** from one of these (choose one):
   - **Groq** (Recommended - Fast & Free): https://console.groq.com
   - **Google Gemini** (Free): https://makersuite.google.com/app/apikey
   - **Hugging Face** (Free): https://huggingface.co/settings/tokens
   - **Ollama** (Local - No API key!): https://ollama.ai/download

---

## 📝 Step-by-Step Instructions

### Step 1: Start MongoDB (Choose ONE option)

#### Option A: Local MongoDB
```bash
# Windows (run as Administrator)
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Option B: Docker MongoDB (Easiest!)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Option C: MongoDB Atlas (Cloud - Free)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Use that string in `.env` file

**Verify MongoDB is running:**
```bash
mongosh --eval "db.version()"
```

---

### Step 2: Get FREE API Key (Choose ONE)

#### ⭐ Option 1: Groq (RECOMMENDED - Fastest!)

1. Go to: https://console.groq.com
2. Sign up (free)
3. Go to API Keys section
4. Create new API key
5. Copy the key (starts with `gsk_...`)

**Free limits**: 30 requests/minute, 14,400/day - More than enough!

#### Option 2: Google Gemini (Also Great!)

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Create API key
4. Copy the key

**Free limits**: 60 requests/minute

#### Option 3: Hugging Face

1. Go to: https://huggingface.co/settings/tokens
2. Sign up/login
3. Create new token
4. Copy the token

#### Option 4: Ollama (100% Local & Free!)

1. Download: https://ollama.ai/download
2. Install Ollama
3. Open terminal and run:
   ```bash
   ollama pull llama3
   ollama serve
   ```
4. No API key needed!

---

### Step 3: Backend Setup

**Open Terminal/PowerShell in project folder:**

```bash
# Navigate to backend
cd ScamShield-AI-scam-detection-app-main/backend

# Install dependencies (takes 2-3 minutes)
npm install
```

**Create .env file:**

```bash
# Copy example file
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

**Edit `.env` file** - Open in any text editor and add:

```env
# MongoDB (choose your option)
MONGODB_URI=mongodb://localhost:27017/scamshield

# JWT Secret (any random string)
JWT_SECRET=my-super-secret-key-for-jwt-tokens-change-me

# AI Provider (choose one: groq, gemini, huggingface, ollama)
AI_PROVIDER=groq

# Add YOUR API key here (based on what you chose):
GROQ_API_KEY=gsk_your_groq_key_here
# OR
GEMINI_API_KEY=your_gemini_key_here
# OR
HUGGINGFACE_API_KEY=your_hf_key_here
# OR (for Ollama - no key needed, just uncomment)
# OLLAMA_URL=http://localhost:11434

# Server config
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Start Backend:**

```bash
npm run dev
```

**✅ Success! You should see:**
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
✅ ScamShield AI Backend Ready!
```

---

### Step 4: Frontend Setup

**Open NEW Terminal/PowerShell window:**

```bash
# Navigate to frontend
cd ScamShield-AI-scam-detection-app-main/frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Windows: Copy-Item .env.example .env
```

**Edit frontend `.env` file:**

```env
VITE_API_URL=http://localhost:5000/api
```

**Start Frontend:**

```bash
npm run dev
```

**✅ Success! You should see:**
```
VITE v5.x.x ready in XXX ms
➜ Local:   http://localhost:5173/
```

---

### Step 5: Open & Test! 🎉

1. **Open browser**: http://localhost:5173
2. **Register**: Create new account
3. **Test Scam Detection**:

Try this message:
```
URGENT! You won $1,000,000 in lottery!
Share your OTP and bank details now to claim prize.
Click here: http://bit.ly/fake-link
```

4. **Should detect as SCAM** with high confidence! 🛡️

---

## 🧪 Quick API Test

Test if backend is working:

```bash
# Health check
curl http://localhost:5000/health

# Should return: {"status":"OK","message":"ScamShield AI Backend is running",...}
```

---

## ❌ Troubleshooting

### Problem: MongoDB Connection Error

**Error**: `MongoNetworkError: connect ECONNREFUSED`

**Solution**:
```bash
# Check if MongoDB is running
mongosh

# If not, start it:
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Docker: docker start mongodb
```

### Problem: Port 5000 Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find what's using port 5000
# Windows:
netstat -ano | findstr :5000

# macOS/Linux:
lsof -i :5000

# Kill that process or change PORT in .env to 5001
```

### Problem: API Key Invalid

**Error**: `401 Unauthorized` or `Invalid API key`

**Solution**:
1. Check API key is correctly copied (no spaces)
2. Verify AI_PROVIDER matches your key (groq, gemini, etc.)
3. Check API key is active on provider's dashboard

### Problem: npm install fails

**Solution**:
```bash
# Clear cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install

# Windows:
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

---

## 🎯 What's Running?

After successful setup:

| Service | URL | Status Check |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Open in browser |
| Backend API | http://localhost:5000 | curl http://localhost:5000/health |
| MongoDB | localhost:27017 | mongosh |

---

## 📊 Check What AI Provider is Being Used

Backend will log on startup:
```
Using AI Provider: groq
Model: mixtral-8x7b-32768
```

---

## 🆘 Still Not Working?

**Check these in order:**

1. ✅ MongoDB is running: `mongosh`
2. ✅ .env file exists in backend folder
3. ✅ API key is correct in .env
4. ✅ AI_PROVIDER matches your key
5. ✅ Both terminals are open (backend + frontend)
6. ✅ No errors in terminal logs

**Get detailed logs:**
```bash
# Backend terminal - check for errors
# Look for MongoDB connection
# Look for "AI Provider: xxx"
# Look for any red error messages
```

---

## 🎓 Test Different Features

### 1. Test Text Message
```
Your account has been blocked. 
Verify now with OTP to unlock.
```

### 2. Test URL
```
http://paypa1-secure.tk/verify
```

### 3. Test Hindi Message
```
आपका अकाउंट ब्लॉक हो गया है।
तुरंत OTP शेयर करें।
```

### 4. Test Chat
Ask: "How can I identify phishing emails?"

---

## 🚀 Next Steps

- ✅ Test all features
- ✅ Check scan history
- ✅ Try chat with AI
- ✅ Download PDF report
- ✅ Test multilingual detection

---

## 💡 Pro Tips

1. **Groq is fastest** - Use for best experience
2. **Gemini has higher rate limits** - Good for heavy usage
3. **Ollama is completely free** - But needs good computer
4. **Keep both terminals open** - Backend and frontend
5. **Check logs for errors** - They're very helpful

---

**Project is ready! Happy Scam Hunting! 🛡️**

**Need help?** Check:
- `SETUP_GUIDE.md` - Detailed guide
- `API_TESTING.md` - Test APIs
- `FEATURES_CHECKLIST.md` - All features
