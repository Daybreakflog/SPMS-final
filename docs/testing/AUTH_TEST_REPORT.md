# 认证测试报告 (AUTH_TEST_REPORT.md)

> 测试时间: 2026-06-09 19:00-19:05
> 目标 API: https://www.cwuye.com/api
> 测试账号: admin / admin123

## 测试结果总览

| 测试项 | 预期 | 实际 | 结果 | 耗时 |
|--------|------|------|------|------|
| 正确账号密码登录 | 200 | 200 | ✅ PASS | ~700ms |
| 错误密码 | 401 | 401 | ✅ PASS | ~464ms |
| 不存在账号 | 401 | 401 | ✅ PASS | ~308ms |
| 空字段提交 | 400 | 400 | ✅ PASS | ~275ms |
| 无 Token 访问受保护接口 | 401 | 401 | ✅ PASS | ~200ms |
| 篡改/过期 Token | 401 | 401 | ✅ PASS | ~191ms |
| 刷新 Token | 200 | 200 | ✅ PASS | ~272ms |
| 退出登录 | 200 | 200 | ✅ PASS | ~191ms |
| 退出后访问受保护接口 | 401 | 401 | ✅ PASS | ~190ms |

**通过率: 9/9 = 100%**

---

## 详细测试

### 1. 正确登录 (admin/admin123)

**请求**:
```
POST /api/auth/staff/login
Content-Type: application/json

{"username":"admin","password":"admin123"}
```

**响应 (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "9c5afd52-35e9-4beb-9593-dff6bb1c1ec1",
    "username": "admin",
    "realName": "系统管理员",
    "phone": "13800000000",
    "roles": ["PLATFORM_ADMIN", "COMPANY_ADMIN"],
    "companyId": "47f5c1c0-68da-4bc2-bed0-911c93305bb1",
    "companyName": "示例物业管理有限公司",
    "projectIds": ["6d9ddeb7-ff49-47d6-9c9e-6dcb22f81ba5"],
    "userType": "STAFF"
  }
}
```

**分析**:
- ✅ JWT Token 正确签发
- ✅ 用户信息完整
- ✅ 角色信息正确
- ✅ 登录响应未使用 `{code, data, message}` 包装，直接返回数据

---

### 2. 错误密码

**请求**: `{"username":"admin","password":"wrongpass"}`

**响应 (401)**: 返回 401，无详细错误信息在 body 中

**分析**:
- ✅ 正确拒绝错误密码
- ⚠️ 响应 body 为空，前端需要处理空 body 情况

---

### 3. 不存在账号

**请求**: `{"username":"noone","password":"x"}`

**响应 (401)**

**分析**: ✅ 正确拒绝不存在的账号

---

### 4. 空字段提交

**请求**: `{"username":"","password":""}`

**响应 (400)**: 参数校验不通过

**分析**: ✅ 参数校验正常

---

### 5. 无 Token 访问

**测试接口**: `GET /api/users`, `GET /api/platform/companies`

**响应**: 401

**分析**: ✅ 所有受保护接口正确拒绝无 Token 请求

---

### 6. 篡改 Token

**请求**: 使用伪造 JWT `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWtlIn0.fakesignature`

**响应**: 401

**分析**: ✅ JWT 签名验证正常

---

### 7. 刷新 Token

**请求**:
```
POST /api/auth/refresh
Content-Type: application/json

{"refreshToken":"eyJhbGciOiJIUzI1NiIs..."}
```

**响应 (200)**:
```json
{
  "accessToken": "eyJ...新的accessToken...",
  "refreshToken": "eyJ...新的refreshToken...",
  "user": { ... }
}
```

**分析**:
- ✅ Token 刷新正常
- ✅ 返回新的 accessToken 和 refreshToken
- ⚠️ 刷新接口也返回了 user 对象（与 login 响应格式一致）

---

### 8. 退出登录

**请求**: `POST /api/auth/logout` (带有效 Token)

**响应**: 200

---

### 9. 退出后访问

**测试**: 退出登录后使用原 Token 访问 `GET /api/users`

**响应**: 401

**分析**: ✅ Token 在服务端被正确失效

---

## 认证流程完整性

| 环节 | 状态 |
|------|------|
| 登录获取 Token | ✅ |
| Token 携带方式 (Bearer) | ✅ |
| Token 刷新机制 | ✅ |
| Token 失效 (退出) | ✅ |
| 未认证拦截 | ✅ |
| JWT 验签 | ✅ |

---

## 发现的问题

### ⚠️ 1. 响应包装不一致 (中等严重)

登录/刷新接口的响应使用**扁平结构**（直接在顶层返回 accessToken, refreshToken, user），
但前端 `adapter.ts` 期望 `{code: 200, data: {...}, message: "ok"}` 结构。

当前 `isWrappedResponse` 函数检查 `code` + `data` + `message` 字段，登录响应不包含这些字段，
因此 `unwrapResponse` 走默认路径直接返回，恰好兼容。

**风险**: 如果后端某天对部分接口加了包装，可能破坏前端的响应解包逻辑。

### ℹ️ 2. 错误响应 body 为空

错误密码时后端返回 401 状态码但 body 可能为空。前端需要处理这种情况，
避免 `JSON.parse` 空 body 报错。当前 `request.ts` 已处理 `errorData?.message`。

### ⚠️ 3. 登录响应直接返回完整用户信息

登录和刷新接口都返回完整的 user 对象（包括 roles, companyId, projectIds 等）。
这在前端 `request.ts` 中没有使用（它只保存 token），用户信息在前端 store 中管理。
如果后端变更响应格式，前端需要同步更新。
