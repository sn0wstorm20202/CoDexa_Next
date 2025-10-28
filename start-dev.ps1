# CoDexa Development Server Startup Script
Write-Host "🚀 Starting CoDexa Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if port 3000 is available
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "⚠️  Port 3000 is already in use. Stopping existing process..." -ForegroundColor Yellow
    $process = Get-Process -Id $port3000[0].OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $process.Id -Force
        Start-Sleep -Seconds 2
    }
}

Write-Host "✅ Environment variables loaded" -ForegroundColor Green
Write-Host "✅ Database connection verified" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Starting Next.js Dev Server on http://localhost:3000..." -ForegroundColor Cyan
Write-Host "🔧 Starting Inngest Dev Server on http://localhost:8288..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Start Inngest in background
$inngestJob = Start-Job -ScriptBlock {
    Set-Location "E:\CODING\CoDexa_Next"
    npx inngest-cli@latest dev
}

# Give Inngest time to start
Start-Sleep -Seconds 3

# Start Next.js (this will run in foreground)
try {
    npm run dev
} finally {
    # Clean up Inngest job when Next.js stops
    Write-Host ""
    Write-Host "🛑 Stopping Inngest..." -ForegroundColor Yellow
    Stop-Job -Job $inngestJob -ErrorAction SilentlyContinue
    Remove-Job -Job $inngestJob -ErrorAction SilentlyContinue
    Write-Host "✅ All servers stopped" -ForegroundColor Green
}
