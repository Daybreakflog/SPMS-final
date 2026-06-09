$ErrorActionPreference = "Continue"
$baseUrl = "https://www.cwuye.com/api"
$token = ""
$refreshToken = ""

function Invoke-API {
    param([string]$method, [string]$path, $body, $extraHeaders = @{})
    $uri = "$baseUrl$path"
    $headers = @{'Content-Type' = 'application/json'}
    if ($token) { $headers['Authorization'] = "Bearer $token" }
    foreach ($k in $extraHeaders.Keys) { $headers[$k] = $extraHeaders[$k] }
    $start = Get-Date
    try {
        $params = @{Uri=$uri; Method=$method; Headers=$headers; TimeoutSec=10; UseBasicParsing=$true}
        if ($body -and $method -ne 'GET') {
            if ($body -is [string]) { $params['Body'] = $body }
            else { $params['Body'] = ($body | ConvertTo-Json -Depth 5) }
        }
        $resp = Invoke-WebRequest @params
        $elapsed = ((Get-Date) - $start).TotalMilliseconds
        return @{Success=$true; StatusCode=$resp.StatusCode; Content=$resp.Content; TimeMs=$elapsed}
    } catch {
        $elapsed = ((Get-Date) - $start).TotalMilliseconds
        $sc = $_.Exception.Response.StatusCode.value__
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        return @{Success=$false; StatusCode=$sc; Content=$body; TimeMs=$elapsed}
    }
}

function Write-Result {
    param($test, $expected, $result)
    $status = if ($result.StatusCode -eq $expected) { "PASS" } else { "FAIL" }
    $line = "$status | $test | Expected $expected | Got $($result.StatusCode) | $($result.TimeMs)ms"
    Write-Host $line
    return @{Test=$test; Status=$status; Expected=$expected; Actual=$result.StatusCode; TimeMs=$result.TimeMs; Response=$result.Content}
}

Write-Host "=== PHASE 4: AUTH TESTS ==="

# Test 1: Login success
$loginBody = @{username='admin';password='admin123'} | ConvertTo-Json
$r = Invoke-API -method POST -path "/auth/staff/login" -body $loginBody
$t1 = Write-Result -test "Login with correct credentials" -expected 200 -result $r
if ($r.Success) {
    $json = $r.Content | ConvertFrom-Json
    $token = $json.accessToken
    $refreshToken = $json.refreshToken
    $userId = $json.user.id
    Write-Host "  -> Got token: $($token.Substring(0,30))..."
    Write-Host "  -> Roles: $($json.user.roles -join ', ')"
}

# Test 2: Login wrong password
$wrongBody = @{username='admin';password='wrongpass'} | ConvertTo-Json
$r = Invoke-API -method POST -path "/auth/staff/login" -body $wrongBody
$t2 = Write-Result -test "Login with wrong password" -expected 401 -result $r

# Test 3: Login non-existent account
$nobody = @{username='noone';password='pass123'} | ConvertTo-Json
$r = Invoke-API -method POST -path "/auth/staff/login" -body $nobody
$t3 = Write-Result -test "Login with non-existent account" -expected 401 -result $r

# Test 4: Access API without token
$r = Invoke-API -method GET -path "/users"
$t4 = Write-Result -test "Access /users without token" -expected 401 -result $r

# Test 5: Access API with expired token (tampered)
$oldToken = $token
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0In0.fake"
$r = Invoke-API -method GET -path "/users"
$t5 = Write-Result -test "Access with tampered token" -expected 401 -result $r
$token = $oldToken

# Test 6: Logout
$r = Invoke-API -method POST -path "/auth/logout"
$t6 = Write-Result -test "Logout" -expected 200 -result $r

# Test 7: Refresh token
$refreshBody = @{refreshToken=$refreshToken} | ConvertTo-Json
$r = Invoke-API -method POST -path "/auth/refresh" -body $refreshBody
$t7 = Write-Result -test "Refresh token" -expected 200 -result $r
if ($r.Success) {
    $json = $r.Content | ConvertFrom-Json
    $token = $json.accessToken
    Write-Host "  -> Token refreshed"
}

# Test 8: Empty fields
$emptyBody = @{username='';password=''} | ConvertTo-Json
$r = Invoke-API -method POST -path "/auth/staff/login" -body $emptyBody
$t8 = Write-Result -test "Login with empty fields" -expected 400 -result $r

Write-Host "`n=== PHASE 5: RBAC TESTS (as PLATFORM_ADMIN + COMPANY_ADMIN) ==="

# Admin token already set
$rbacResults = @()

# Test sensitive pages/APIs
$rbacTests = @(
    @{method='GET';path='/platform/companies';name='Platform Companies';expect=200},
    @{method='GET';path='/platform/companies/stats';name='Company Stats';expect=200},
    @{method='GET';path='/system/audit-logs';name='Audit Logs';expect=200},
    @{method='GET';path='/users';name='Users List';expect=200},
    @{method='GET';path='/projects';name='Projects';expect=200},
    @{method='GET';path='/dashboard/overview';name='Dashboard';expect=200},
    @{method='GET';path='/billing/bills';name='Bills';expect=200},
    @{method='GET';path='/payments/orders';name='Payments';expect=200},
    @{method='GET';path='/contracts';name='Contracts';expect=200},
    @{method='GET';path='/complaints';name='Complaints';expect=200},
    @{method='GET';path='/repairs';name='Repairs';expect=200},
    @{method='GET';path='/announcements';name='Announcements';expect=200},
    @{method='GET';path='/renters';name='Renters';expect=200},
    @{method='GET';path='/leases';name='Leases';expect=200},
    @{method='GET';path='/reports/financial/rent-income';name='Reports Financial';expect=200},
    @{method='GET';path='/reports/operational/repair-analysis';name='Reports Operational';expect=200},
    @{method='GET';path='/billing/fee-items';name='Fee Items';expect=200}
)

foreach ($t in $rbacTests) {
    $r = Invoke-API -method $t.method -path $t.path
    $res = Write-Result -test "[RBAC] $($t.name)" -expected $t.expect -result $r
    $rbacResults += $res
}

Write-Host "`n=== PHASE 6: BUSINESS FLOW TESTS ==="
$bfResults = @()

# Test CRUD for key entities - will test with sample IDs from list responses

# Get users list to get a user ID for detail/update tests
$r = Invoke-API -method GET -path "/users?page=1&pageSize=5"
$bfResults += Write-Result -test "Users list" -expected 200 -result $r
$firstUserId = $null
if ($r.Success) {
    try {
        $json = $r.Content | ConvertFrom-Json
        if ($json.data -and $json.data.Count -gt 0) {
            $firstUserId = $json.data[0].id
        } elseif ($json.items -and $json.items.Count -gt 0) {
            $firstUserId = $json.items[0].id
        } elseif ($json.Count -gt 0 -and $json[0].id) {
            $firstUserId = $json[0].id
        }
    } catch {}
}
Write-Host "  -> First user ID: $firstUserId"

# User detail
if ($firstUserId) {
    $r = Invoke-API -method GET -path "/users/$firstUserId"
    $bfResults += Write-Result -test "User detail" -expected 200 -result $r
}

# Create a test user
$testUsername = "testuser_$(Get-Date -Format 'HHmmss')"
$createUserBody = @{
    username = $testUsername
    realName = "测试用户"
    password = "Test123456"
    phone = "13900000000"
    roles = @("ENGINEER")
    companyId = "47f5c1c0-68da-4bc2-bed0-911c93305bb1"
    projectIds = @("6d9ddeb7-ff49-47d6-9c9e-6dcb22f81ba5")
}
$r = Invoke-API -method POST -path "/users" -body $createUserBody
$bfResults += Write-Result -test "Create user" -expected 200 -result $r
$newUserId = $null
if ($r.Success) {
    try {
        $json = $r.Content | ConvertFrom-Json
        $newUserId = if ($json.id) { $json.id } elseif ($json.data.id) { $json.data.id }
    } catch {}
    Write-Host "  -> New user ID: $newUserId"
}

# Update user
if ($newUserId) {
    $updateBody = @{realName="测试用户更新";phone="13900000001"}
    $r = Invoke-API -method PATCH -path "/users/$newUserId" -body $updateBody
    $bfResults += Write-Result -test "Update user" -expected 200 -result $r
    
    # Delete user
    $r = Invoke-API -method DELETE -path "/users/$newUserId"
    $bfResults += Write-Result -test "Delete user" -expected 200 -result $r
}

# Contract CRUD test
$r = Invoke-API -method GET -path "/contracts?page=1&pageSize=5"
$bfResults += Write-Result -test "Contracts list" -expected 200 -result $r
$firstContractId = $null
if ($r.Success) {
    try {
        $json = $r.Content | ConvertFrom-Json
        $item = $null
        if ($json.data) { $item = $json.data[0] } elseif ($json.items) { $item = $json.items[0] } elseif ($json[0]) { $item = $json[0] }
        if ($item) { $firstContractId = $item.id }
    } catch {}
}
if ($firstContractId) {
    $r = Invoke-API -method GET -path "/contracts/$firstContractId"
    $bfResults += Write-Result -test "Contract detail" -expected 200 -result $r
}

# Announcement CRUD
$r = Invoke-API -method GET -path "/announcements?page=1&pageSize=5"
$bfResults += Write-Result -test "Announcements list" -expected 200 -result $r

# Billing bills test
$r = Invoke-API -method GET -path "/billing/bills?page=1&pageSize=5"
$bfResults += Write-Result -test "Bills list" -expected 200 -result $r

# Payment orders test
$r = Invoke-API -method GET -path "/payments/orders?page=1&pageSize=5"
$bfResults += Write-Result -test "Payment orders" -expected 200 -result $r

# Repair orders test
$r = Invoke-API -method GET -path "/repairs?page=1&pageSize=5"
$bfResults += Write-Result -test "Repair orders" -expected 200 -result $r

# Complaint test
$r = Invoke-API -method GET -path "/complaints?page=1&pageSize=5"
$bfResults += Write-Result -test "Complaints list" -expected 200 -result $r

# Renters test
$r = Invoke-API -method GET -path "/renters?page=1&pageSize=5"
$bfResults += Write-Result -test "Renters list" -expected 200 -result $r

# Leases test
$r = Invoke-API -method GET -path "/leases?page=1&pageSize=5"
$bfResults += Write-Result -test "Leases list" -expected 200 -result $r

# Dashboard
$r = Invoke-API -method GET -path "/dashboard/overview"
$bfResults += Write-Result -test "Dashboard overview" -expected 200 -result $r

Write-Host "`n=== PHASE 7: SECURITY TESTS ==="
$secResults = @()

# SQL injection attempt
$sqlBody = @{username="admin' OR '1'='1";password="' OR '1'='1"} | ConvertTo-Json
$r = Invoke-API -method POST -path "/auth/staff/login" -body $sqlBody
$secResults += Write-Result -test "SQL injection login" -expected 401 -result $r

# XSS attempt
$xssBody = @{username="<script>alert(1)</script>";password="<script>alert(1)</script>"} | ConvertTo-Json
$r = Invoke-API -method POST -path "/auth/staff/login" -body $xssBody
$secResults += Write-Result -test "XSS login attempt" -expected 401 -result $r

# Non-existent ID
$r = Invoke-API -method GET -path "/users/00000000-0000-0000-0000-000000000000"
$secResults += Write-Result -test "Non-existent user ID" -expected 404 -result $r

# Oversized parameter
$bigString = "A" * 10000
$bigBody = @{username=$bigString;password='pass'} | ConvertTo-Json
$r = Invoke-API -method POST -path "/auth/staff/login" -body $bigBody
$secResults += Write-Result -test "Oversized username" -expected 400 -result $r

# Delete non-existent
$r = Invoke-API -method DELETE -path "/users/00000000-0000-0000-0000-000000000000"
$secResults += Write-Result -test "Delete non-existent user" -expected 404 -result $r

# Method not allowed
$r = Invoke-API -method PUT -path "/auth/staff/login" -body $loginBody
$secResults += Write-Result -test "Wrong HTTP method on login" -expected 404 -result $r

# Empty body
$r = Invoke-API -method POST -path "/auth/staff/login" -body "{}"
$secResults += Write-Result -test "Empty login body" -expected 400 -result $r

Write-Host "`n=== Generating summary output ==="

$total = @($t1,$t2,$t3,$t4,$t5,$t6,$t7,$t8) + $rbacResults + $bfResults + $secResults
$passCount = ($total | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($total | Where-Object { $_.Status -eq "FAIL" }).Count

Write-Host "`n========== SUMMARY =========="
Write-Host "Total tests: $($total.Count)"
Write-Host "PASS: $passCount"
Write-Host "FAIL: $failCount"

$jsonOutput = @{
    baseUrl = $baseUrl
    timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    authTests = @($t1,$t2,$t3,$t4,$t5,$t6,$t7,$t8)
    rbacTests = $rbacResults
    businessFlowTests = $bfResults
    securityTests = $secResults
    summary = @{total=$total.Count;pass=$passCount;fail=$failCount}
} | ConvertTo-Json -Depth 4

Set-Content -Path "test-results.json" -Value $jsonOutput -Encoding UTF8
Write-Host "Results saved to test-results.json"
