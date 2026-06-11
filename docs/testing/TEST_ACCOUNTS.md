# 测试账号清单 (TEST_ACCOUNTS.md)

> 生成时间: 2026-06-09
> 目标系统: https://www.cwuye.com/api

## 发现方式

| 来源 | 位置 | 结果 |
|------|------|------|
| E2E Fixtures | `e2e/fixtures.ts` | `admin / admin123` |
| MSW Mock Handlers | `src/mocks/handlers/auth.ts` | `admin / admin123` |
| 真实 API 登录测试 | `POST /auth/staff/login` | ✅ 验证通过 |
| API 文档 | `智慧物业管理系统_API文档.md` | 仅定义 DTO，无预设账号 |
| Seed 数据 | 未发现 | 无本地 seed 脚本 |

## 可用账号

| 角色 | 账号 | 密码 | 验证状态 |
|------|------|------|----------|
| PLATFORM_ADMIN + COMPANY_ADMIN | `admin` | `admin123` | ✅ 真实登录通过 (200) |
| FINANCE | 未发现 | - | ❌ 无可测试账号 |
| PROJECT_ADMIN | 未发现 | - | ❌ 无可测试账号 |
| CUSTOMER_SERVICE | 未发现 | - | ❌ 无可测试账号 |
| ENGINEER | 未发现 | - | ❌ 无可测试账号 |
| OPERATIONS | 未发现 | - | ❌ 无可测试账号 |
| TENANT | 未发现 | - | ❌ 无可测试账号 |

## 已登录用户信息 (admin)

```json
{
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
```

## 系统中已有用户 (3 个)

从 `/users` 接口获取到的用户列表（共3个）:

1. **admin** (系统管理员) - PLATFORM_ADMIN + COMPANY_ADMIN
2. **engineer01** (陈工程) - 推测 ENGINEER 角色
3. 第三个用户未在 pageSize=1 的查询中返回

## 建议

1. **缺少多角色测试账号**: 当前只有一个 `admin` 账号可用，无法完整测试 RBAC
2. **建议创建以下测试账号**:
   - finance / Test123456 (FINANCE 角色)
   - engineer / Test123456 (ENGINEER 角色)
   - service / Test123456 (CUSTOMER_SERVICE 角色)
   - ops / Test123456 (OPERATIONS 角色)
   - tenant / Test123456 (TENANT 角色 - 租户端)
3. **engineer01 密码未知**，无法测试其角色权限
