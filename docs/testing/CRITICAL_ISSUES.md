# CRITICAL_ISSUES.md

> Audit date: 2026-06-09
> Conclusion: SPMS is NOT ready for production. 4 blocking issues + 3 high-risk issues.

---

## BLOCKING - Must Fix Before Launch

### C-01: System Settings Page is 100% Non-Functional

Severity: CRITICAL / BLOCKING

Files: src/services/setting.service.ts, src/pages/system/settings/index.tsx

All 4 methods in setting.service.ts are hardcoded stubs returning Promise.resolve(DEFAULT_SETTING).
No HTTP calls are made. All "Save" operations in the system settings page are no-ops.
After page refresh, all changes are lost.

Evidence: src/services/setting.service.ts lines 14-23

Impact: System settings page is completely unusable in production.

Fix: Backend must implement /system/settings endpoints. Frontend must replace stubs with real HTTP calls.

---

### C-02: 17 Routes Have No Page-Level RBAC Protection

Severity: CRITICAL / BLOCKING

Files: src/router/index.tsx, src/router/routes.config.ts

17 out of 31 routes lack roleLoader configuration.
Any logged-in user can access these pages by entering the URL directly.
Menu hiding is the ONLY protection, which is trivially bypassed.

Affected routes:
- /contracts + detail
- /billing/fee-items
- /billing/bills + detail
- /billing/meter-readings
- /service/repairs + detail
- /service/complaints + detail
- /notice/announcements
- /notice/notifications
- /customers/renters + detail
- /properties/tree
- /properties/leases + detail
- /dashboard
- /profile

Evidence: src/router/index.tsx - these routes lack loader: roleLoader([...])

Impact: CUSTOMER_SERVICE can access financial data. ENGINEER can access tenant management. De facto privilege escalation.

Fix: Add roleLoader to each route matching the roles defined in routes.config.ts.

---

### C-03: MSW Mocks Out of Sync with Real Backend

Severity: CRITICAL / BLOCKING

Files: src/mocks/handlers/setting.ts, src/services/setting.service.ts

MSW defines 4 setting endpoints that DO NOT EXIST in Swagger:
- GET /api/system/settings
- PATCH /api/system/settings/basic
- PATCH /api/system/settings/notification
- PATCH /api/system/settings/security

Swagger only has: GET /api/system/audit-logs

Evidence: src/mocks/handlers/setting.ts vs Swagger doc

Impact: Dev environment behavior differs from production. MSW hides missing API issues.

Fix: Ensure MSW handlers only mock endpoints that actually exist in the backend.

---

### C-04: Hardcoded 30-Minute Session Timeout

Severity: CRITICAL / BLOCKING

Files: src/api/request.ts

SESSION_TIMEOUT = 30 * 60 * 1000 is hardcoded. After 30 minutes of inactivity,
the frontend clears tokens and redirects to login regardless of refresh token validity.
This contradicts the (fake) configurable session timeout on the settings page.

Evidence: src/api/request.ts line 19

Impact: Poor UX. Contradicts configurable security policy claims.

Fix: Session timeout should be fetched from backend or work with refresh token mechanism.

---

## HIGH RISK

### H-01: Setting Service Stub Fails Silently

The settings page calls settingService.updateXxx(), receives Promise.resolve(DEFAULT_SETTING),
and shows success message. No error is ever thrown. The user believes settings were saved.

### H-02: Engineer Role Completely Untestable

System has engineer01 user but password is unknown. Zero RBAC coverage for ENGINEER role.
All ENGINEER-specific functionality is unverified.

### H-03: Contract Delete Permission Too Broad

ContractActionRoles.delete includes CUSTOMER_SERVICE.
A customer service agent can delete contracts.
This is defined in src/constants/status.ts line 106.

---

Audit completed: 2026-06-09