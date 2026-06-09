$ErrorActionPreference = "Continue"
$baseUrl = "https://www.cwuye.com/api"
$token = ""
$refreshToken = ""
$results = @()

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
            else { $params['Body'] = ($body | ConvertTo-Json -Depth 5 -Compress) }
        }
        $resp = Invoke-WebRequest @params
        $elapsed = ((Get-Date) - $start).TotalMilliseconds
        return @{ Status = [int]$resp.StatusCode; Body = $resp.Content; Elapsed = $elapsed }
    } catch {
        $elapsed = ((Get-Date) - $start).TotalMilliseconds
        $sc = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode.value__ } else { 0 }
        $b = ""
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $b = $reader.ReadToEnd()
        } catch { $b = $_.Exception.Message }
        return @{ Status = $sc; Body = $b; Elapsed = $elapsed }
    }
}

function Test-Case {
    param([string]$phase, [string]$name, $expectedStatus, $actual, [string]$note = "")
    $passed = ($actual.Status -eq $expectedStatus)
    $emoji = if ($passed) { "PASS" } else { "FAIL" }
    $line = "$emoji | [$phase] $name | Exp: $expectedStatus | Got: $($actual.Status) | $([math]::Round($actual.Elapsed,0))ms"
    if ($note) { $line += " | $note" }
    Write-Host $line
    $results += @{ Phase=$phase; Name=$name; Expected=$expectedStatus; Got=$actual.Status; Passed=$passed; Elapsed=$actual.Elapsed; Note=$note; Body=$actual.Body }
    return $passed
}

function Login-Admin {
    $body = @{username='admin';password='admin123'}
    $r = Invoke-API "POST" "/auth/staff/login" $body
    $json = $r.Body | ConvertFrom-Json
    if ($json.accessToken) {
        $script:token = $json.accessToken
        $script:refreshToken = $json.refreshToken
        return @{UserId=$json.user.id; CompanyId=$json.user.companyId; ProjectId=$json.user.projectIds[0]; Roles=$json.user.roles}
    }
    return $null
}

function Clear-Tokens {
    $script:token = ""
    $script:refreshToken = ""
}

Write-Host "=================================="
Write-Host "  SPMS INTEGRATION TEST REPORT"
Write-Host "  Target: $baseUrl"
Write-Host "  Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "=================================="

# ============== PHASE 4: AUTH TESTS ==============
Write-Host "`n=== PHASE 4: AUTH TESTS ==="

Clear-Tokens
$r = Login-Admin
$userInfo = $r
$u = $r

Test-Case "AUTH" "Correct login (admin/admin123)" 200 (Invoke-API "POST" "/auth/staff/login" @{username='admin';password='admin123'}) "Roles: $([string]::Join(', ', $userInfo.Roles))"

# Save token from correct login
$loginResp = Invoke-API "POST" "/auth/staff/login" @{username='admin';password='admin123'}
$lj = $loginResp.Body | ConvertFrom-Json
$token = $lj.accessToken
$refreshToken = $lj.refreshToken

Test-Case "AUTH" "Wrong password" 401 (Invoke-API "POST" "/auth/staff/login" @{username='admin';password='wrongpass'}) ""
Test-Case "AUTH" "Non-existent user" 401 (Invoke-API "POST" "/auth/staff/login" @{username='noone';password='x'}) ""
Test-Case "AUTH" "Empty fields" 400 (Invoke-API "POST" "/auth/staff/login" @{username='';password=''}) ""

# No token access
Clear-Tokens
Test-Case "AUTH" "Access /users without token" 401 (Invoke-API "GET" "/users") "SECURITY: Should require auth"
Test-Case "AUTH" "Access /platform/companies without token" 401 (Invoke-API "GET" "/platform/companies") ""

# Tampered token
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWtlIiwiaWF0IjoxNjE2MTYwNjAwfQ.fakesignature"
Test-Case "AUTH" "Tampered/expired token" 401 (Invoke-API "GET" "/users") ""

# Re-login for refresh test
$loginResp = Invoke-API "POST" "/auth/staff/login" @{username='admin';password='admin123'}
$lj2 = $loginResp.Body | ConvertFrom-Json
$token = $lj2.accessToken
$refreshToken = $lj2.refreshToken

# Refresh token test - need to use correct endpoint format
$rtBody = @{refreshToken=$refreshToken}
Test-Case "AUTH" "Refresh token" 200 (Invoke-API "POST" "/auth/refresh" $rtBody) ""

# Logout test (will invalidate current token)
Test-Case "AUTH" "Logout" 200 (Invoke-API "POST" "/auth/logout") ""

# After logout, token should be invalid
Test-Case "AUTH" "Access after logout" 401 (Invoke-API "GET" "/users") "Token should be invalid after logout"

# ============== PHASE 5: RBAC TESTS ==============
Write-Host "`n=== PHASE 5: RBAC TESTS ==="
# Re-login for RBAC tests
Clear-Tokens
$loginResp = Invoke-API "POST" "/auth/staff/login" @{username='admin';password='admin123'}
$lj = $loginResp.Body | ConvertFrom-Json
$token = $lj.accessToken
$refreshToken = $lj.refreshToken
$adminRoles = $lj.user.roles -join ', '
$adminUid = $lj.user.id
$adminCid = $lj.user.companyId
$adminPid = $lj.user.projectIds[0]
Write-Host "-> Logged in as: $($lj.user.realName) ($($lj.user.username))"
Write-Host "-> Roles: $adminRoles"
Write-Host "-> CompanyId: $adminCid"
Write-Host "-> ProjectId: $adminPid"

$rbacTests = @(
    @{Name="Platform Companies"; Path="/platform/companies"; Exp=200}
    @{Name="Platform Companies Detail"; Path="/platform/companies/$adminCid"; Exp=200}
    @{Name="Audit Logs"; Path="/system/audit-logs"; Exp=200}
    @{Name="Users List"; Path="/users"; Exp=200}
    @{Name="Projects"; Path="/projects"; Exp=200}
    @{Name="Dashboard"; Path="/dashboard/overview"; Exp=200}
    @{Name="Bills"; Path="/billing/bills"; Exp=200}
    @{Name="Payments"; Path="/payments/orders"; Exp=200}
    @{Name="Contracts"; Path="/contracts"; Exp=200}
    @{Name="Complaints"; Path="/complaints"; Exp=200}
    @{Name="Repairs"; Path="/repairs"; Exp=200}
    @{Name="Announcements"; Path="/announcements"; Exp=200}
    @{Name="Renters"; Path="/renters"; Exp=200}
    @{Name="Leases"; Path="/leases"; Exp=200}
    @{Name="Reports Financial"; Path="/reports/financial/rent-income"; Exp=200}
    @{Name="Reports Operational"; Path="/reports/operational/repair-analysis"; Exp=200}
    @{Name="Fee Items"; Path="/billing/fee-items"; Exp=200}
    @{Name="System Settings"; Path="/system/settings"; Exp=200}
    @{Name="Property Tree"; Path="/properties/projects/$adminPid/tree"; Exp=200}
)

foreach ($t in $rbacTests) {
    Test-Case "RBAC" $t.Name $t.Exp (Invoke-API "GET" $t.Path) ""
}

# ============== PHASE 6: BUSINESS FLOW TESTS ==============
Write-Host "`n=== PHASE 6: BUSINESS FLOW TESTS ==="

# Users CRUD
$usersResp = Invoke-API "GET" "/users" (@{page=1;pageSize=10})
$usersBody = $usersResp.Body | ConvertFrom-Json
if ($usersResp.Status -eq 200) {
    $firstUserId = if ($usersBody.rows) { $usersBody.rows[0].id } elseif ($usersBody.id) { $usersBody.id } else { "" }
    if ($firstUserId) {
        $firstUserId = ($firstUserId -split ',')[0]
        $firstUserId = ($firstUserId -replace '[\[\]\"]', '')
    }
    Test-Case "BUSINESS" "Users list" 200 $usersResp "Found: $(if($usersBody.total){$usersBody.total}else{'N/A'}) total"
    
    if ($firstUserId) {
        $userDetail = Invoke-API "GET" "/users/$firstUserId"
        Test-Case "BUSINESS" "User detail" 200 $userDetail "ID: $firstUserId"
    }
} else {
    Test-Case "BUSINESS" "Users list" 200 $usersResp "CRITICAL FAIL"
}

# Contracts
$cResp = Invoke-API "GET" "/contracts" (@{page=1;pageSize=10})
$cBody = $cResp.Body | ConvertFrom-Json
if ($cResp.Status -eq 200) {
    $firstContractId = if ($cBody.rows) { $cBody.rows[0].id } elseif ($cBody.id) { $cBody.id } else { "" }
    if ($firstContractId) { $firstContractId = ($firstContractId -split ',')[0]; $firstContractId = ($firstContractId -replace '[\[\]\"]', '') }
    Test-Case "BUSINESS" "Contracts list" 200 $cResp "Total: $(if($cBody.total){$cBody.total}else{'N/A'})"
    if ($firstContractId) {
        Test-Case "BUSINESS" "Contract detail" 200 (Invoke-API "GET" "/contracts/$firstContractId") "ID: $firstContractId"
    }
} else {
    Test-Case "BUSINESS" "Contracts list" 200 $cResp "CRITICAL FAIL"
}

# Announcements
$annResp = Invoke-API "GET" "/announcements" (@{page=1;pageSize=10})
Test-Case "BUSINESS" "Announcements list" 200 $annResp ""

# Bills
$billResp = Invoke-API "GET" "/billing/bills" (@{page=1;pageSize=10})
Test-Case "BUSINESS" "Bills list" 200 $billResp ""

# Payments
$payResp = Invoke-API "GET" "/payments/orders" (@{page=1;pageSize=10})
Test-Case "BUSINESS" "Payments list" 200 $payResp ""

# Repairs
$repResp = Invoke-API "GET" "/repairs" (@{page=1;pageSize=10})
Test-Case "BUSINESS" "Repairs list" 200 $repResp ""

# Complaints
$compResp = Invoke-API "GET" "/complaints" (@{page=1;pageSize=10})
Test-Case "BUSINESS" "Complaints list" 200 $compResp ""

# Renters
$renResp = Invoke-API "GET" "/renters" (@{page=1;pageSize=10})
Test-Case "BUSINESS" "Renters list" 200 $renResp ""

# Leases
$leaseResp = Invoke-API "GET" "/leases" (@{page=1;pageSize=10})
Test-Case "BUSINESS" "Leases list" 200 $leaseResp ""

# Dashboard
$dashResp = Invoke-API "GET" "/dashboard/overview"
Test-Case "BUSINESS" "Dashboard overview" 200 $dashResp ""

# Reports
$rentIncResp = Invoke-API "GET" "/reports/financial/rent-income" (@{startDate='2025-01-01';endDate='2025-12-31'})
Test-Case "BUSINESS" "Rent income report" 200 $rentIncResp ""

$collResp = Invoke-API "GET" "/reports/financial/collection-rate" (@{startDate='2025-01-01';endDate='2025-12-31'})
Test-Case "BUSINESS" "Collection rate report" 200 $collResp ""

# Properties
Test-Case "BUSINESS" "Property tree" 200 (Invoke-API "GET" "/properties/projects/$adminPid/tree") ""

# Fee Items
Test-Case "BUSINESS" "Fee items list" 200 (Invoke-API "GET" "/billing/fee-items" (@{page=1;pageSize=10})) ""

# Audit logs
Test-Case "BUSINESS" "Audit logs list" 200 (Invoke-API "GET" "/system/audit-logs" (@{page=1;pageSize=10})) ""

# ============== PHASE 7: SECURITY TESTS ==============
Write-Host "`n=== PHASE 7: SECURITY TESTS ==="

# Clear token for security tests
Clear-Tokens

# SQL injection
Test-Case "SECURITY" "SQL injection login" 401 (Invoke-API "POST" "/auth/staff/login" @{username="admin' OR '1'='1";password="' OR '1'='1"}) ""
Test-Case "SECURITY" "XSS login attempt" 401 (Invoke-API "POST" "/auth/staff/login" @{username="<script>alert(1)</script>";password="<script>alert(1)</script>"}) ""

# Re-login for authenticated security tests
$loginResp = Invoke-API "POST" "/auth/staff/login" @{username='admin';password='admin123'}
$lj = $loginResp.Body | ConvertFrom-Json
$token = $lj.accessToken
$refreshToken = $lj.refreshToken

# Non-existent resource
Test-Case "SECURITY" "Non-existent user ID" 404 (Invoke-API "GET" "/users/00000000-0000-0000-0000-000000000000") ""
Test-Case "SECURITY" "Non-existent company ID" 404 (Invoke-API "GET" "/platform/companies/00000000-0000-0000-0000-000000000000") ""
Test-Case "SECURITY" "Delete non-existent user" 404 (Invoke-API "DELETE" "/users/00000000-0000-0000-0000-000000000000") ""

# Invalid params
Test-Case "SECURITY" "Oversized page size" 400 (Invoke-API "GET" "/users" @{page=1;pageSize=99999}) ""
Test-Case "SECURITY" "Negative page" 400 (Invoke-API "GET" "/users" @{page=-1;pageSize=10}) ""

# Wrong method
Test-Case "SECURITY" "Wrong HTTP method on login" 404 (Invoke-API "GET" "/auth/staff/login") ""
Test-Case "SECURITY" "Empty login body" 400 (Invoke-API "POST" "/auth/staff/login" @{}) ""

# Direct sensitive page access simulation (API level)
Clear-Tokens
Test-Case "SECURITY" "Unauth access system audit-logs" 401 (Invoke-API "GET" "/system/audit-logs") ""
Test-Case "SECURITY" "Unauth access platform companies" 401 (Invoke-API "GET" "/platform/companies") ""
Test-Case "SECURITY" "Unauth access billing data" 401 (Invoke-API "GET" "/billing/bills") ""

# ============== SUMMARY ==============
Write-Host "`n========== SUMMARY =========="
$total = $results.Count
$pass = ($results | Where-Object { $_.Passed }).Count
$fail = $total - $pass

Write-Host "Total tests: $total"
Write-Host "PASS: $pass"
Write-Host "FAIL: $fail"

# Count by phase
$phases = $results | Group-Object Phase
foreach ($p in $phases) {
    $pp = ($p.Group | Where-Object { $_.Passed }).Count
    $pf = $p.Count - $pp
    Write-Host "  $($p.Name): $pp PASS / $pf FAIL (total $($p.Count))"
}

# Save to JSON
$results | ConvertTo-Json -Depth 3 | Out-File "test-results.json" -Encoding UTF8
Write-Host "`nResults saved to test-results.json"
