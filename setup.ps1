# ScamShield AI - Automated Setup Script (Windows PowerShell)
# Run this script to automatically setup the project

Write-Host "`n🛡️  ScamShield AI - Automated Setup`n" -ForegroundColor Cyan

# Check Node.js
Write-Host "✓ Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js not found! Please install from nodejs.org" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "✓ Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ npm installed: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ npm not found!" -ForegroundColor Red
    exit 1
}

# Check MongoDB
Write-Host "✓ Checking MongoDB..." -ForegroundColor Yellow
$mongoCheck = mongosh --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ MongoDB installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠ MongoDB not found. You can:" -ForegroundColor Yellow
    Write-Host "    1. Install MongoDB locally" -ForegroundColor Yellow
    Write-Host "    2. Use Docker: docker run -d -p 27017:27017 mongo" -ForegroundColor Yellow
    Write-Host "    3. Use MongoDB Atlas (cloud)" -ForegroundColor Yellow
}

Write-Host "`n📦 Installing Backend Dependencies..." -ForegroundColor Cyan
Set-Location -Path "backend"

if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Backend dependencies installed!" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✗ package.json not found in backend folder!" -ForegroundColor Red
    exit 1
}

# Create .env file
Write-Host "`n⚙️  Creating .env file..." -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  ✓ .env file created!" -ForegroundColor Green
    Write-Host "  ⚠ IMPORTANT: Edit backend/.env and add your API keys!" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ .env file already exists" -ForegroundColor Green
}

Set-Location -Path ".."

Write-Host "`n📦 Installing Frontend Dependencies..." -ForegroundColor Cyan
Set-Location -Path "frontend"

if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Frontend dependencies installed!" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✗ package.json not found in frontend folder!" -ForegroundColor Red
    exit 1
}

# Create frontend .env file
Write-Host "`n⚙️  Creating frontend .env file..." -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  ✓ Frontend .env file created!" -ForegroundColor Green
} else {
    Write-Host "  ✓ Frontend .env file already exists" -ForegroundColor Green
}

Set-Location -Path ".."

Write-Host "`n" -NoNewline
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "`n" -NoNewline
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Get FREE API key from one of these:" -ForegroundColor White
Write-Host "     - Groq (Recommended): https://console.groq.com" -ForegroundColor Yellow
Write-Host "     - Google Gemini: https://makersuite.google.com/app/apikey" -ForegroundColor Yellow
Write-Host "     - Hugging Face: https://huggingface.co/settings/tokens" -ForegroundColor Yellow
Write-Host ""
Write-Host "  2. Edit backend/.env file:" -ForegroundColor White
Write-Host "     - Set AI_PROVIDER=groq (or gemini, huggingface)" -ForegroundColor Yellow
Write-Host "     - Add your API key" -ForegroundColor Yellow
Write-Host "     - Set MONGODB_URI if using Atlas" -ForegroundColor Yellow
Write-Host ""
Write-Host "  3. Start MongoDB:" -ForegroundColor White
Write-Host "     - Local: net start MongoDB" -ForegroundColor Yellow
Write-Host "     - Docker: docker run -d -p 27017:27017 mongo" -ForegroundColor Yellow
Write-Host ""
Write-Host "  4. Run the project:" -ForegroundColor White
Write-Host "     Terminal 1: cd backend && npm run dev" -ForegroundColor Yellow
Write-Host "     Terminal 2: cd frontend && npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "  5. Open browser: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed instructions, see RUN_PROJECT.md" -ForegroundColor Cyan
Write-Host ""
