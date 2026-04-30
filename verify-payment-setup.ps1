# Payment Setup Verification Script
# This script verifies that all payment-related configurations are correct

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CapShop Payment Setup Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allChecks = @()

# Check 1: Backend appsettings.json
Write-Host "Checking Backend Configuration..." -ForegroundColor Yellow
$appsettingsPath = "backend/services/CapShop.PaymentService/appsettings.json"
if (Test-Path $appsettingsPath) {
    $content = Get-Content $appsettingsPath -Raw
    if ($content -match '"TestMode":\s*true') {
        Write-Host "✅ TestMode flag found in appsettings.json" -ForegroundColor Green
        $allChecks += $true
    } else {
        Write-Host "❌ TestMode flag NOT found in appsettings.json" -ForegroundColor Red
        $allChecks += $false
    }
    
    if ($content -match '"KeyId":\s*"rzp_test_') {
        Write-Host "✅ Test API Key found" -ForegroundColor Green
        $allChecks += $true
    } else {
        Write-Host "❌ Test API Key NOT found" -ForegroundColor Red
        $allChecks += $false
    }
} else {
    Write-Host "❌ appsettings.json NOT found at: $appsettingsPath" -ForegroundColor Red
    $allChecks += $false
}

Write-Host ""

# Check 2: RazorpayDtos.cs
Write-Host "Checking DTO Configuration..." -ForegroundColor Yellow
$dtosPath = "backend/services/CapShop.PaymentService/DTOs/RazorpayDtos.cs"
if (Test-Path $dtosPath) {
    $content = Get-Content $dtosPath -Raw
    if ($content -match 'public bool TestMode') {
        Write-Host "✅ TestMode property found in RazorpayDtos.cs" -ForegroundColor Green
        $allChecks += $true
    } else {
        Write-Host "❌ TestMode property NOT found in RazorpayDtos.cs" -ForegroundColor Red
        $allChecks += $false
    }
} else {
    Write-Host "❌ RazorpayDtos.cs NOT found at: $dtosPath" -ForegroundColor Red
    $allChecks += $false
}

Write-Host ""

# Check 3: PaymentController.cs
Write-Host "Checking Controller Configuration..." -ForegroundColor Yellow
$controllerPath = "backend/services/CapShop.PaymentService/Controllers/PaymentController.cs"
if (Test-Path $controllerPath) {
    $content = Get-Content $controllerPath -Raw
    if ($content -match 'GetValue<bool>\("Razorpay:TestMode"') {
        Write-Host "✅ TestMode configuration found in PaymentController.cs" -ForegroundColor Green
        $allChecks += $true
    } else {
        Write-Host "❌ TestMode configuration NOT found in PaymentController.cs" -ForegroundColor Red
        $allChecks += $false
    }
} else {
    Write-Host "❌ PaymentController.cs NOT found at: $controllerPath" -ForegroundColor Red
    $allChecks += $false
}

Write-Host ""

# Check 4: CheckoutPage.jsx
Write-Host "Checking Frontend Configuration..." -ForegroundColor Yellow
$checkoutPath = "frontend/capshop-client/src/pages/customer/CheckoutPage.jsx"
if (Test-Path $checkoutPath) {
    $content = Get-Content $checkoutPath -Raw
    if ($content -match 'order\.testMode') {
        Write-Host "✅ Test mode handling found in CheckoutPage.jsx" -ForegroundColor Green
        $allChecks += $true
    } else {
        Write-Host "❌ Test mode handling NOT found in CheckoutPage.jsx" -ForegroundColor Red
        $allChecks += $false
    }
    
    if ($content -match 'success@razorpay') {
        Write-Host "✅ Test VPA configuration found" -ForegroundColor Green
        $allChecks += $true
    } else {
        Write-Host "❌ Test VPA configuration NOT found" -ForegroundColor Red
        $allChecks += $false
    }
} else {
    Write-Host "❌ CheckoutPage.jsx NOT found at: $checkoutPath" -ForegroundColor Red
    $allChecks += $false
}

Write-Host ""

# Check 5: Documentation files
Write-Host "Checking Documentation..." -ForegroundColor Yellow
$docFiles = @(
    "RAZORPAY_TEST_GUIDE.md",
    "RAZORPAY_DASHBOARD_SETUP.md",
    "PAYMENT_TESTING_QUICK_REFERENCE.md",
    "PAYMENT_FIX_SUMMARY.md",
    "PAYMENT_FIX_HINDI_SUMMARY.md"
)

foreach ($file in $docFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
        $allChecks += $true
    } else {
        Write-Host "❌ $file NOT found" -ForegroundColor Red
        $allChecks += $false
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Calculate success rate
$totalChecks = $allChecks.Count
$passedChecks = ($allChecks | Where-Object { $_ -eq $true }).Count
$successRate = [math]::Round(($passedChecks / $totalChecks) * 100, 2)

Write-Host "Verification Results:" -ForegroundColor Cyan
Write-Host "Total Checks: $totalChecks" -ForegroundColor White
Write-Host "Passed: $passedChecks" -ForegroundColor Green
Write-Host "Failed: $($totalChecks - $passedChecks)" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } else { "Yellow" })

Write-Host ""

if ($successRate -eq 100) {
    Write-Host "🎉 All checks passed! Payment setup is complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Start backend services (Ports 5000-5005)" -ForegroundColor White
    Write-Host "2. Start frontend (npm run dev)" -ForegroundColor White
    Write-Host "3. Test card payment: 5267 3181 8797 5449" -ForegroundColor White
    Write-Host "4. Test UPI payment: success@razorpay" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Documentation:" -ForegroundColor Cyan
    Write-Host "- RAZORPAY_TEST_GUIDE.md - Complete testing guide" -ForegroundColor White
    Write-Host "- PAYMENT_TESTING_QUICK_REFERENCE.md - Quick reference" -ForegroundColor White
} else {
    Write-Host "⚠️ Some checks failed. Please review the errors above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common Solutions:" -ForegroundColor Cyan
    Write-Host "1. Make sure all code changes are saved" -ForegroundColor White
    Write-Host "2. Check file paths are correct" -ForegroundColor White
    Write-Host "3. Review PAYMENT_FIX_SUMMARY.md for details" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
