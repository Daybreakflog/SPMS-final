---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 8c3cb5d21104bd08ad8b9c6f7f99ea03_5e5f2e36623f11f1832e5254006c9bbf
    ReservedCode1: D16qvr+T9LAs16Kz3FjOYTVktzHaD8I/QhKlenT8M3PUTKQu5vx9HB6XOQxnzfslOG+hS5SjO/TitWlSJcdkf1E1NC21GU0DL3RLhfkPDjbkDd5LrPtDCfjIM3BtKE3koBfx8t1RFBlxDYutgFZzC18S/S0ifw3r1P6QPUY2ow1HBMmrbZy+QRYAwv8=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 8c3cb5d21104bd08ad8b9c6f7f99ea03_5e5f2e36623f11f1832e5254006c9bbf
    ReservedCode2: D16qvr+T9LAs16Kz3FjOYTVktzHaD8I/QhKlenT8M3PUTKQu5vx9HB6XOQxnzfslOG+hS5SjO/TitWlSJcdkf1E1NC21GU0DL3RLhfkPDjbkDd5LrPtDCfjIM3BtKE3koBfx8t1RFBlxDYutgFZzC18S/S0ifw3r1P6QPUY2ow1HBMmrbZy+QRYAwv8=
---

# 智慧物业管理系统 API
**版本**: 1.0  
**描述**: 智慧物业管理系统后端接口文档  
**认证方式**: Bearer JWT  

## 目录

### API 接口
1. [健康检查（1 个接口）](#健康检查)
2. [认证（7 个接口）](#认证)
3. [平台管理（5 个接口）](#平台管理)
4. [项目管理（7 个接口）](#项目管理)
5. [用户管理（7 个接口）](#用户管理)
6. [租户管理（10 个接口）](#租户管理)
7. [房源管理（13 个接口）](#房源管理)
8. [入住退租（5 个接口）](#入住退租)
9. [合同（12 个接口）](#合同)
10. [缴费（11 个接口）](#缴费)
11. [Excel（1 个接口）](#excel)
12. [支付（5 个接口）](#支付)
13. [文件管理（3 个接口）](#文件管理)
14. [报修（11 个接口）](#报修)
15. [系统（1 个接口）](#系统)
16. [投诉（7 个接口）](#投诉)
17. [消息与公告（9 个接口）](#消息与公告)
18. [仪表盘（2 个接口）](#仪表盘)
19. [报表（5 个接口）](#报表)


---

# API 接口文档

## 健康检查

### GET `/api/health`

> **健康检查**  
> `operationId`: HealthController_check  
> 🌐 公开  

**响应**:

- `200`: 

---

## 认证

### POST `/api/auth/staff/login`

> **管理端账号密码登录**  
> `operationId`: AuthController_staffLogin  
> 🌐 公开  

**请求体**: `application/json`

```
$ref: #/components/schemas/LoginDto
```
> 详见 [DTO: LoginDto](#dto-logindto)

**DTO:** LoginDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `username` | string | 是 | - | - |
| `password` | string | 是 | - | - |


**响应**:

- `200`: 

---

### POST `/api/auth/tenant/login`

> **租户端账号密码登录**  
> `operationId`: AuthController_tenantLogin  
> 🌐 公开  

**请求体**: `application/json`

```
$ref: #/components/schemas/TenantLoginDto
```
> 详见 [DTO: TenantLoginDto](#dto-tenantlogindto)

**DTO:** TenantLoginDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `username` | string | 是 | - | - |
| `password` | string | 是 | - | - |


**响应**:

- `200`: 

---

### POST `/api/auth/tenant/register`

> **租户端注册**  
> `operationId`: AuthController_tenantRegister  
> 🌐 公开  

**请求体**: `application/json`

```
$ref: #/components/schemas/TenantRegisterDto
```
> 详见 [DTO: TenantRegisterDto](#dto-tenantregisterdto)

**DTO:** TenantRegisterDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `username` | string | 是 | - | - |
| `password` | string | 是 | - | - |
| `phone` | string | 否 | - | - |
| `renterProfileId` | string | 否 | - | - |


**响应**:

- `200`: 

---

### POST `/api/auth/wx-login`

> **微信登录（租户端传 clientType=tenant）**  
> `operationId`: AuthController_wxLogin  
> 🌐 公开  

**请求体**: `application/json`

```
$ref: #/components/schemas/WxLoginDto
```
> 详见 [DTO: WxLoginDto](#dto-wxlogindto)

**DTO:** WxLoginDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `code` | string | 是 | - | - |
| `clientType` | string | 否 | 租户端 wx-login 时传 tenant | - |

---
*（内容由AI生成，仅供参考）*


**响应**:

- `200`: 

---

### POST `/api/auth/tenant/bind-renter`

> **租户绑定档案**  
> `operationId`: AuthController_bindRenter  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/BindRenterDto
```
> 详见 [DTO: BindRenterDto](#dto-bindrenterdto)

**DTO:** BindRenterDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `renterProfileId` | string | 是 | - | - |


**响应**:

- `200`: 

---

### POST `/api/auth/refresh`

> **刷新令牌**  
> `operationId`: AuthController_refresh  
> 🌐 公开  

**请求体**: `application/json`

```
$ref: #/components/schemas/RefreshTokenDto
```
> 详见 [DTO: RefreshTokenDto](#dto-refreshtokendto)

**DTO:** RefreshTokenDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `refreshToken` | string | 是 | - | - |


**响应**:

- `200`: 

---

### POST `/api/auth/logout`

> **退出登录**  
> `operationId`: AuthController_logout  
> 🔒 需认证  

**响应**:

- `200`: 

---

## 平台管理

### GET `/api/platform/companies`

> **分页查询物业公司**  
> `operationId`: PlatformController_findAll  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `page` | query | number | 否 | - | 1 |
| `pageSize` | query | number | 否 | - | 20 |
| `keyword` | query | string | 否 | 关键词（名称/编码/联系人） | - |
| `status` | query | number | 否 | 状态筛选 | - |

**响应**:

- `200`: 

---

### POST `/api/platform/companies`

> **创建物业公司**  
> `operationId`: PlatformController_create  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateCompanyDto
```
> 详见 [DTO: CreateCompanyDto](#dto-createcompanydto)

**DTO:** CreateCompanyDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `name` | string | 是 | 公司名称 | - |
| `code` | string | 是 | 公司编码 | - |
| `contact` | string | 否 | 联系人 | - |
| `phone` | string | 否 | 联系电话 | - |
| `address` | string | 否 | 地址 | - |
| `status` | number | 否 | 状态：1 启用，0 禁用 | 1 |


**响应**:

- `201`: 

---

### GET `/api/platform/companies/{id}`

> **获取物业公司详情**  
> `operationId`: PlatformController_findOne  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### PATCH `/api/platform/companies/{id}`

> **更新物业公司**  
> `operationId`: PlatformController_update  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/UpdateCompanyDto
```
> 详见 [DTO: UpdateCompanyDto](#dto-updatecompanydto)

**DTO:** UpdateCompanyDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `name` | string | 否 | 公司名称 | - |
| `code` | string | 否 | 公司编码 | - |
| `contact` | string | 否 | 联系人 | - |
| `phone` | string | 否 | 联系电话 | - |
| `address` | string | 否 | 地址 | - |
| `status` | number | 否 | 状态：1 启用，0 禁用 | 1 |


**响应**:

- `200`: 

---

### DELETE `/api/platform/companies/{id}`

> **删除物业公司**  
> `operationId`: PlatformController_remove  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

## 项目管理

### GET `/api/projects`

> **分页查询项目（按数据范围过滤）**  
> `operationId`: ProjectController_findAll  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `page` | query | number | 否 | - | 1 |
| `pageSize` | query | number | 否 | - | 20 |
| `companyId` | query | string | 否 | 公司 ID | - |
| `keyword` | query | string | 否 | 关键词（名称/编码） | - |
| `status` | query | number | 否 | 状态筛选 | - |

**响应**:

- `200`: 

---

### POST `/api/projects`

> **创建项目**  
> `operationId`: ProjectController_create  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateProjectDto
```
> 详见 [DTO: CreateProjectDto](#dto-createprojectdto)

**DTO:** CreateProjectDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `companyId` | string | 否 | 所属公司 ID（平台管理员必填） | - |
| `name` | string | 是 | 项目名称 | - |
| `code` | string | 是 | 项目编码 | - |
| `address` | string | 否 | 地址 | - |
| `description` | string | 否 | 描述 | - |
| `status` | number | 否 | 状态：1 启用，0 禁用 | 1 |


**响应**:

- `201`: 

---

### PUT `/api/projects/assign-user-projects`

> **为用户分配项目（覆盖式）**  
> `operationId`: ProjectController_assignUserProjects  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/AssignUserProjectsDto
```
> 详见 [DTO: AssignUserProjectsDto](#dto-assignuserprojectsdto)

**DTO:** AssignUserProjectsDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `userId` | string | 是 | 用户 ID | - |
| `projectIds` | array<string> | 是 | 项目 ID 列表 | - |


**响应**:

- `200`: 

---

### GET `/api/projects/{id}`

> **获取项目详情**  
> `operationId`: ProjectController_findOne  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### PATCH `/api/projects/{id}`

> **更新项目**  
> `operationId`: ProjectController_update  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/UpdateProjectDto
```
> 详见 [DTO: UpdateProjectDto](#dto-updateprojectdto)

**DTO:** UpdateProjectDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `companyId` | string | 否 | 所属公司 ID（平台管理员必填） | - |
| `name` | string | 否 | 项目名称 | - |
| `code` | string | 否 | 项目编码 | - |
| `address` | string | 否 | 地址 | - |
| `description` | string | 否 | 描述 | - |
| `status` | number | 否 | 状态：1 启用，0 禁用 | 1 |


**响应**:

- `200`: 

---

### DELETE `/api/projects/{id}`

> **删除项目**  
> `operationId`: ProjectController_remove  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### PUT `/api/projects/{id}/users`

> **为项目追加分配用户**  
> `operationId`: ProjectController_assignProjectUsers  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/AssignProjectUsersDto
```
> 详见 [DTO: AssignProjectUsersDto](#dto-assignprojectusersdto)

**DTO:** AssignProjectUsersDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `userIds` | array<string> | 是 | 用户 ID 列表 | - |


**响应**:

- `200`: 

---

## 用户管理

### GET `/api/users`

> **分页查询员工用户**  
> `operationId`: UserController_findAll  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `page` | query | number | 否 | - | 1 |
| `pageSize` | query | number | 否 | - | 20 |
| `companyId` | query | string | 否 | 公司 ID | - |
| `keyword` | query | string | 否 | 关键词（用户名/姓名/手机） | - |
| `status` | query | number | 否 | 状态筛选 | - |
| `role` | query | string | 否 | 角色名称筛选 | - |

**响应**:

- `200`: 

---

### POST `/api/users`

> **创建员工用户**  
> `operationId`: UserController_create  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateUserDto
```
> 详见 [DTO: CreateUserDto](#dto-createuserdto)

**DTO:** CreateUserDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `username` | string | 是 | 登录用户名 | - |
| `password` | string | 是 | 登录密码 | - |
| `realName` | string | 是 | 真实姓名 | - |
| `phone` | string | 否 | 手机号 | - |
| `email` | string | 否 | 邮箱 | - |
| `companyId` | string | 否 | 所属公司 ID（平台管理员必填） | - |
| `roles` | array<enum: PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, FINANCE, CUSTOMER_SERVICE, ENGINEER, OPERATIONS> | 否 | 角色名称列表 | - |
| `projectIds` | array<string> | 否 | 初始分配的项目 ID 列表 | - |
| `status` | number | 否 | 状态：1 启用，0 禁用 | 1 |


**响应**:

- `201`: 

---

### GET `/api/users/{id}`

> **获取员工用户详情**  
> `operationId`: UserController_findOne  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### PATCH `/api/users/{id}`

> **更新员工用户**  
> `operationId`: UserController_update  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/UpdateUserDto
```
> 详见 [DTO: UpdateUserDto](#dto-updateuserdto)

**DTO:** UpdateUserDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `username` | string | 否 | 登录用户名 | - |
| `password` | string | 否 | 新密码（留空则不修改） | - |
| `realName` | string | 否 | 真实姓名 | - |
| `phone` | string | 否 | 手机号 | - |
| `email` | string | 否 | 邮箱 | - |
| `companyId` | string | 否 | 所属公司 ID（平台管理员必填） | - |
| `roles` | array<enum: PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, FINANCE, CUSTOMER_SERVICE, ENGINEER, OPERATIONS> | 否 | 角色名称列表 | - |
| `projectIds` | array<string> | 否 | 初始分配的项目 ID 列表 | - |
| `status` | number | 否 | 状态：1 启用，0 禁用 | 1 |


**响应**:

- `200`: 

---

### DELETE `/api/users/{id}`

> **删除员工用户**  
> `operationId`: UserController_remove  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### PUT `/api/users/{id}/roles`

> **分配角色（覆盖式）**  
> `operationId`: UserController_assignRoles  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/AssignRolesDto
```
> 详见 [DTO: AssignRolesDto](#dto-assignrolesdto)

**DTO:** AssignRolesDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `roles` | array<enum: PLATFORM_ADMIN, COMPANY_ADMIN, PROJECT_ADMIN, FINANCE, CUSTOMER_SERVICE, ENGINEER, OPERATIONS> | 是 | 角色名称列表 | - |


**响应**:

- `200`: 

---

### PUT `/api/users/{id}/projects`

> **分配项目（覆盖式）**  
> `operationId`: UserController_assignProjects  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/AssignProjectsDto
```
> 详见 [DTO: AssignProjectsDto](#dto-assignprojectsdto)

**DTO:** AssignProjectsDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `projectIds` | array<string> | 是 | 项目 ID 列表 | - |


**响应**:

- `200`: 

---

## 租户管理

### GET `/api/renters/me`

> **租户端 - 我的档案**  
> `operationId`: RenterController_getMyProfile  
> 🔒 需认证  

**响应**:

- `200`: 

---

### GET `/api/renters`

> **管理端 - 租户档案列表**  
> `operationId`: RenterController_listProfiles  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `page` | query | number | 否 | - | 1 |
| `pageSize` | query | number | 否 | - | 20 |
| `companyId` | query | string | 否 | - | - |
| `keyword` | query | string | 否 | - | - |
| `type` | query | string (enum: PERSON, COMPANY) | 否 | - | - |
| `status` | query | number | 否 | - | - |

**响应**:

- `200`: 

---

### POST `/api/renters`

> **管理端 - 创建租户档案**  
> `operationId`: RenterController_createProfile  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateRenterProfileDto
```
> 详见 [DTO: CreateRenterProfileDto](#dto-createrenterprofiledto)

**DTO:** CreateRenterProfileDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `companyId` | string | 是 | - | - |
| `name` | string | 是 | - | - |
| `type` | string (`PERSON`, `COMPANY`) | 否 | - | PERSON |
| `phone` | string | 否 | - | - |
| `email` | string | 否 | - | - |
| `idNumber` | string | 否 | - | - |
| `creditCode` | string | 否 | - | - |
| `contactName` | string | 否 | - | - |
| `remark` | string | 否 | - | - |


**响应**:

- `201`: 

---

### GET `/api/renters/{id}/accounts`

> **管理端 - 租户账号列表**  
> `operationId`: RenterController_listAccounts  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### POST `/api/renters/{id}/accounts`

> **管理端 - 为租户创建登录账号**  
> `operationId`: RenterController_createAccount  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateRenterAccountDto
```
> 详见 [DTO: CreateRenterAccountDto](#dto-createrenteraccountdto)

**DTO:** CreateRenterAccountDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `username` | string | 是 | - | - |
| `password` | string | 是 | - | - |
| `phone` | string | 否 | - | - |


**响应**:

- `201`: 

---

### PATCH `/api/renters/accounts/{accountId}`

> **管理端 - 更新租户账号**  
> `operationId`: RenterController_updateAccount  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `accountId` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/UpdateRenterAccountDto
```
> 详见 [DTO: UpdateRenterAccountDto](#dto-updaterenteraccountdto)

**DTO:** UpdateRenterAccountDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `phone` | string | 否 | - | - |
| `status` | number | 否 | - | - |


**响应**:

- `200`: 

---

### POST `/api/renters/accounts/{accountId}/reset-password`

> **管理端 - 重置租户账号密码**  
> `operationId`: RenterController_resetPassword  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `accountId` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/ResetRenterAccountPasswordDto
```
> 详见 [DTO: ResetRenterAccountPasswordDto](#dto-resetrenteraccountpassworddto)

**DTO:** ResetRenterAccountPasswordDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `password` | string | 是 | - | - |


**响应**:

- `201`: 

---

### GET `/api/renters/{id}`

> **管理端 - 租户档案详情**  
> `operationId`: RenterController_getProfile  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### PUT `/api/renters/{id}`

> **管理端 - 更新租户档案**  
> `operationId`: RenterController_updateProfile  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/UpdateRenterProfileDto
```
> 详见 [DTO: UpdateRenterProfileDto](#dto-updaterenterprofiledto)

**DTO:** UpdateRenterProfileDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `companyId` | string | 否 | - | - |
| `name` | string | 否 | - | - |
| `type` | string (`PERSON`, `COMPANY`) | 否 | - | PERSON |
| `phone` | string | 否 | - | - |
| `email` | string | 否 | - | - |
| `idNumber` | string | 否 | - | - |
| `creditCode` | string | 否 | - | - |
| `contactName` | string | 否 | - | - |
| `remark` | string | 否 | - | - |
| `status` | number | 否 | - | - |


**响应**:

- `200`: 

---

### DELETE `/api/renters/{id}`

> **管理端 - 删除租户档案**  
> `operationId`: RenterController_deleteProfile  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

## 房源管理

### GET `/api/properties/my-units`

> **租户端 - 我的房源**  
> `operationId`: PropertyController_getMyUnits  
> 🔒 需认证  

**响应**:

- `200`: 

---

### GET `/api/properties/projects/{projectId}/tree`

> **管理端 - 项目房源树（楼栋/楼层/单元）**  
> `operationId`: PropertyController_getProjectTree  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `projectId` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### POST `/api/properties/buildings`

> **管理端 - 新增楼栋**  
> `operationId`: PropertyController_createBuilding  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateBuildingDto
```
> 详见 [DTO: CreateBuildingDto](#dto-createbuildingdto)

**DTO:** CreateBuildingDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `projectId` | string | 是 | - | - |
| `name` | string | 是 | - | - |
| `code` | string | 否 | - | - |
| `sort` | number | 否 | - | 0 |


**响应**:

- `201`: 

---

### PUT `/api/properties/buildings/{id}`

> **管理端 - 更新楼栋**  
> `operationId`: PropertyController_updateBuilding  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/UpdateBuildingDto
```
> 详见 [DTO: UpdateBuildingDto](#dto-updatebuildingdto)

**DTO:** UpdateBuildingDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `projectId` | string | 否 | - | - |
| `name` | string | 否 | - | - |
| `code` | string | 否 | - | - |
| `sort` | number | 否 | - | 0 |


**响应**:

- `200`: 

---

### DELETE `/api/properties/buildings/{id}`

> **管理端 - 删除楼栋**  
> `operationId`: PropertyController_deleteBuilding  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### POST `/api/properties/floors`

> **管理端 - 新增楼层**  
> `operationId`: PropertyController_createFloor  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateFloorDto
```
> 详见 [DTO: CreateFloorDto](#dto-createfloordto)

**DTO:** CreateFloorDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `buildingId` | string | 是 | - | - |
| `name` | string | 是 | - | - |
| `floorNo` | number | 是 | - | - |
| `sort` | number | 否 | - | 0 |


**响应**:

- `201`: 

---

### PUT `/api/properties/floors/{id}`

> **管理端 - 更新楼层**  
> `operationId`: PropertyController_updateFloor  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/UpdateFloorDto
```
> 详见 [DTO: UpdateFloorDto](#dto-updatefloordto)

**DTO:** UpdateFloorDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `buildingId` | string | 否 | - | - |
| `name` | string | 否 | - | - |
| `floorNo` | number | 否 | - | - |
| `sort` | number | 否 | - | 0 |


**响应**:

- `200`: 

---

### DELETE `/api/properties/floors/{id}`

> **管理端 - 删除楼层**  
> `operationId`: PropertyController_deleteFloor  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### POST `/api/properties/units`

> **管理端 - 新增房源单元**  
> `operationId`: PropertyController_createUnit  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateUnitDto
```
> 详见 [DTO: CreateUnitDto](#dto-createunitdto)

**DTO:** CreateUnitDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `floorId` | string | 是 | - | - |
| `name` | string | 是 | - | - |
| `code` | string | 否 | - | - |
| `area` | number | 否 | - | - |
| `unitType` | string (`ROOM`, `SHOP`, `PARKING`) | 否 | - | ROOM |
| `status` | string (`VACANT`, `OCCUPIED`, `MAINTENANCE`) | 否 | - | VACANT |


**响应**:

- `201`: 

---

### PUT `/api/properties/units/{id}`

> **管理端 - 更新房源单元**  
> `operationId`: PropertyController_updateUnit  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/UpdateUnitDto
```
> 详见 [DTO: UpdateUnitDto](#dto-updateunitdto)

**DTO:** UpdateUnitDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `floorId` | string | 否 | - | - |
| `name` | string | 否 | - | - |
| `code` | string | 否 | - | - |
| `area` | number | 否 | - | - |
| `unitType` | string (`ROOM`, `SHOP`, `PARKING`) | 否 | - | ROOM |
| `status` | string (`VACANT`, `OCCUPIED`, `MAINTENANCE`) | 否 | - | VACANT |


**响应**:

- `200`: 

---

### DELETE `/api/properties/units/{id}`

> **管理端 - 删除房源单元**  
> `operationId`: PropertyController_deleteUnit  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### POST `/api/properties/units/{id}/bind`

> **管理端 - 绑定租户到房源**  
> `operationId`: PropertyController_bindRenter  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/BindUnitRenterDto
```
> 详见 [DTO: BindUnitRenterDto](#dto-bindunitrenterdto)

**DTO:** BindUnitRenterDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `renterProfileId` | string | 是 | - | - |


**响应**:

- `201`: 

---

### POST `/api/properties/units/{id}/unbind`

> **管理端 - 解绑房源租户**  
> `operationId`: PropertyController_unbindRenter  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `201`: 

---

## 入住退租

### GET `/api/leases/my`

> **租户端 - 我的入住记录**  
> `operationId`: LeaseController_getMyLeases  
> 🔒 需认证  

**响应**:

- `200`: 

---

### GET `/api/leases`

> **管理端 - 入住记录列表**  
> `operationId`: LeaseController_listLeases  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `page` | query | number | 否 | - | 1 |
| `pageSize` | query | number | 否 | - | 20 |
| `projectId` | query | string | 否 | - | - |
| `unitId` | query | string | 否 | - | - |
| `renterProfileId` | query | string | 否 | - | - |
| `status` | query | string (enum: ACTIVE, CHECKED_OUT) | 否 | - | - |

**响应**:

- `200`: 

---

### GET `/api/leases/{id}`

> **管理端 - 入住记录详情**  
> `operationId`: LeaseController_getLease  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### POST `/api/leases/check-in`

> **管理端 - 办理入住**  
> `operationId`: LeaseController_checkIn  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/CheckInDto
```
> 详见 [DTO: CheckInDto](#dto-checkindto)

**DTO:** CheckInDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `projectId` | string | 是 | - | - |
| `unitId` | string | 是 | - | - |
| `renterProfileId` | string | 是 | - | - |
| `checkInDate` | string | 是 | - | - |
| `remark` | string | 否 | - | - |


**响应**:

- `201`: 

---

### POST `/api/leases/{id}/check-out`

> **管理端 - 办理退租**  
> `operationId`: LeaseController_checkOut  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/CheckOutDto
```
> 详见 [DTO: CheckOutDto](#dto-checkoutdto)

**DTO:** CheckOutDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `checkOutDate` | string | 否 | - | - |
| `remark` | string | 否 | - | - |


**响应**:

- `201`: 

---

## 合同

### POST `/api/contracts`

> **创建合同（草稿）**  
> `operationId`: ContractController_create  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateContractDto
```
> 详见 [DTO: CreateContractDto](#dto-createcontractdto)

**DTO:** CreateContractDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `projectId` | string | 是 | - | - |
| `renterProfileId` | string | 是 | - | - |
| `unitId` | string | 否 | - | - |
| `contractNo` | string | 是 | - | - |
| `startDate` | string | 是 | - | - |
| `endDate` | string | 是 | - | - |
| `rentAmount` | number | 是 | - | - |
| `depositAmount` | number | 否 | - | - |
| `paymentMethod` | string | 是 | - | - |
| `terms` | string | 否 | - | - |
| `attachmentUrl` | string | 否 | - | - |


**响应**:

- `201`: 

---

### GET `/api/contracts`

> **合同列表**  
> `operationId`: ContractController_findAll  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `page` | query | number | 否 | - | 1 |
| `pageSize` | query | number | 否 | - | 20 |
| `projectId` | query | string | 否 | - | - |
| `renterProfileId` | query | string | 否 | - | - |
| `status` | query | string | 否 | - | - |
| `contractNo` | query | string | 否 | - | - |

**响应**:

- `200`: 

---

### GET `/api/contracts/{id}`

> **合同详情**  
> `operationId`: ContractController_findOne  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### PATCH `/api/contracts/{id}`

> **更新草稿合同**  
> `operationId`: ContractController_update  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/UpdateContractDto
```
> 详见 [DTO: UpdateContractDto](#dto-updatecontractdto)

**DTO:** UpdateContractDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `unitId` | string | 否 | - | - |
| `startDate` | string | 否 | - | - |
| `endDate` | string | 否 | - | - |
| `rentAmount` | number | 否 | - | - |
| `depositAmount` | number | 否 | - | - |
| `paymentMethod` | string | 否 | - | - |
| `terms` | string | 否 | - | - |
| `attachmentUrl` | string | 否 | - | - |


**响应**:

- `200`: 

---

### DELETE `/api/contracts/{id}`

> **删除草稿合同**  
> `operationId`: ContractController_remove  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### POST `/api/contracts/{id}/submit`

> **提交审批 DRAFT -> PENDING_FINANCE**  
> `operationId`: ContractController_submit  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/ContractActionDto
```
> 详见 [DTO: ContractActionDto](#dto-contractactiondto)

**DTO:** ContractActionDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `comment` | string | 否 | - | - |


**响应**:

- `201`: 

---

### POST `/api/contracts/{id}/finance/approve`

> **财务审批通过 -> PENDING_ADMIN**  
> `operationId`: ContractController_financeApprove  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/ContractActionDto
```
**DTO:** ContractActionDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `comment` | string | 否 | - | - |

**响应**:

- `201`: 

---

### POST `/api/contracts/{id}/finance/reject`

> **财务驳回 -> REJECTED**  
> `operationId`: ContractController_financeReject  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/ContractActionDto
```
**DTO:** ContractActionDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `comment` | string | 否 | - | - |

**响应**:

- `201`: 

---

### POST `/api/contracts/{id}/admin/sign`

> **管理员签署 -> ACTIVE**  
> `operationId`: ContractController_adminSign  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/ContractActionDto
```
**DTO:** ContractActionDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `comment` | string | 否 | - | - |

**响应**:

- `201`: 

---

### POST `/api/contracts/{id}/admin/reject`

> **管理员驳回 -> REJECTED**  
> `operationId`: ContractController_adminReject  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/ContractActionDto
```
**DTO:** ContractActionDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `comment` | string | 否 | - | - |

**响应**:

- `201`: 

---

### POST `/api/contracts/{id}/terminate`

> **终止合同 -> TERMINATED**  
> `operationId`: ContractController_terminate  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/ContractActionDto
```
**DTO:** ContractActionDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `comment` | string | 否 | - | - |

**响应**:

- `201`: 

---

### POST `/api/contracts/{id}/renew`

> **续签合同（新建草稿）**  
> `operationId`: ContractController_renew  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/RenewContractDto
```
> 详见 [DTO: RenewContractDto](#dto-renewcontractdto)

**DTO:** RenewContractDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `contractNo` | string | 是 | - | - |
| `startDate` | string | 是 | - | - |
| `endDate` | string | 是 | - | - |
| `rentAmount` | number | 否 | - | - |
| `depositAmount` | number | 否 | - | - |
| `paymentMethod` | string | 否 | - | - |
| `terms` | string | 否 | - | - |


**响应**:

- `201`: 

---

## 缴费

### POST `/api/billing/fee-items`

> **创建费项**  
> `operationId`: BillingController_createFeeItem  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateFeeItemDto
```
> 详见 [DTO: CreateFeeItemDto](#dto-createfeeitemdto)

**DTO:** CreateFeeItemDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `projectId` | string | 是 | - | - |
| `name` | string | 是 | - | - |
| `code` | string | 是 | - | - |
| `billingRule` | string | 是 | FIXED | BY_AREA | BY_METER | - |
| `unitPrice` | number | 是 | - | - |
| `cycle` | string | 否 | - | MONTHLY |
| `status` | number | 否 | - | 1 |


**响应**:

- `201`: 

---

### GET `/api/billing/fee-items`

> **费项列表**  
> `operationId`: BillingController_findFeeItems  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `page` | query | number | 否 | - | 1 |
| `pageSize` | query | number | 否 | - | 20 |
| `projectId` | query | string | 否 | - | - |
| `code` | query | string | 否 | - | - |
| `status` | query | number | 否 | - | - |

**响应**:

- `200`: 

---

### GET `/api/billing/fee-items/{id}`

> **费项详情**  
> `operationId`: BillingController_findFeeItem  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### PATCH `/api/billing/fee-items/{id}`

> **更新费项**  
> `operationId`: BillingController_updateFeeItem  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/UpdateFeeItemDto
```
> 详见 [DTO: UpdateFeeItemDto](#dto-updatefeeitemdto)

**DTO:** UpdateFeeItemDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `name` | string | 否 | - | - |
| `billingRule` | string | 否 | - | - |
| `unitPrice` | number | 否 | - | - |
| `cycle` | string | 否 | - | - |
| `status` | number | 否 | - | - |


**响应**:

- `200`: 

---

### DELETE `/api/billing/fee-items/{id}`

> **删除费项**  
> `operationId`: BillingController_removeFeeItem  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### GET `/api/billing/bills`

> **账单列表**  
> `operationId`: BillingController_findBills  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `page` | query | number | 否 | - | 1 |
| `pageSize` | query | number | 否 | - | 20 |
| `projectId` | query | string | 否 | - | - |
| `renterProfileId` | query | string | 否 | - | - |
| `status` | query | string | 否 | - | - |
| `published` | query | boolean | 否 | - | - |

**响应**:

- `200`: 

---

### GET `/api/billing/bills/{id}`

> **账单详情**  
> `operationId`: BillingController_findBill  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### POST `/api/billing/bills/manual`

> **手工创建账单**  
> `operationId`: BillingController_createManualBill  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateManualBillDto
```
> 详见 [DTO: CreateManualBillDto](#dto-createmanualbilldto)

**DTO:** CreateManualBillDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `projectId` | string | 是 | - | - |
| `renterProfileId` | string | 是 | - | - |
| `billDate` | string | 是 | - | - |
| `dueDate` | string | 是 | - | - |
| `remark` | string | 否 | - | - |
| `items` | array<[ManualBillItemDto](#dto-manualbillitemdto)> | 是 | - | - |


**DTO:** ManualBillItemDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `feeItemId` | string | 否 | - | - |
| `name` | string | 是 | - | - |
| `amount` | number | 是 | - | - |
| `quantity` | number | 否 | - | 1 |
| `unitPrice` | number | 否 | - | - |
| `remark` | string | 否 | - | - |

**响应**:

- `201`: 

---

### POST `/api/billing/bills/generate`

> **批量生成账单**  
> `operationId`: BillingController_generateBills  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/GenerateBillDto
```
> 详见 [DTO: GenerateBillDto](#dto-generatebilldto)

**DTO:** GenerateBillDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `projectId` | string | 是 | - | - |
| `billDate` | string | 是 | 账单月份，如 2026-05-01 | - |
| `renterProfileIds` | array<string> | 否 | 指定租户，不传则生成项目下全部在租租户 | - |
| `feeItemIds` | array<string> | 否 | 指定费项，不传则使用全部启用费项 | - |


**响应**:

- `201`: 

---

### POST `/api/billing/bills/publish`

> **发布账单**  
> `operationId`: BillingController_publishBills  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/PublishBillDto
```
> 详见 [DTO: PublishBillDto](#dto-publishbilldto)

**DTO:** PublishBillDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `billIds` | array<string> | 是 | - | - |


**响应**:

- `201`: 

---

### POST `/api/billing/meter-readings/import`

> **Excel 导入抄表数据**  
> `operationId`: BillingController_importMeterReadings  
> 🔒 需认证  

**请求体**: `application/json`

**Content-Type**: multipart/form-data

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `file` | file(binary) | 是 | - |
| `projectId` | string | 是 | - |
| `feeItemId` | string | 是 | - |
| `periodStart` | string | 是 | - |
| `periodEnd` | string | 是 | - |

**响应**:

- `201`: 

---

## Excel

### GET `/api/excel/meter-readings/template`

> **下载抄表导入模板**  
> `operationId`: ExcelController_downloadMeterTemplate  
> 🔒 需认证  

**响应**:

- `200`: 

---

## 支付

### POST `/api/payments/orders`

> **创建支付订单（Stub 预下单）**  
> `operationId`: PaymentController_createOrder  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/CreatePaymentOrderDto
```
> 详见 [DTO: CreatePaymentOrderDto](#dto-createpaymentorderdto)

**DTO:** CreatePaymentOrderDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `renterAccountId` | string | 是 | - | - |
| `amount` | number | 是 | - | - |
| `channel` | string | 是 | WECHAT | ALIPAY | BANK | - |
| `description` | string | 否 | - | - |


**响应**:

- `201`: 

---

### GET `/api/payments/orders`

> **支付订单列表**  
> `operationId`: PaymentController_findOrders  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `page` | query | number | 否 | - | 1 |
| `pageSize` | query | number | 否 | - | 20 |
| `renterAccountId` | query | string | 否 | - | - |
| `status` | query | string | 否 | - | - |

**响应**:

- `200`: 

---

### GET `/api/payments/orders/{id}`

> **支付订单详情**  
> `operationId`: PaymentController_findOrder  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### POST `/api/payments/notify`

> **支付回调（需 X-Payment-Notify-Secret）**  
> `operationId`: PaymentController_notify  
> 🌐 公开  

**请求体**: `application/json`

```
$ref: #/components/schemas/PaymentNotifyDto
```
> 详见 [DTO: PaymentNotifyDto](#dto-paymentnotifydto)

**DTO:** PaymentNotifyDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `orderNo` | string | 是 | - | - |
| `amount` | number | 是 | - | - |
| `transactionId` | string | 否 | - | - |
| `channel` | string | 否 | - | WECHAT |


**响应**:

- `201`: 

---

### POST `/api/payments/mock/success`

> **模拟支付成功回调（仅非生产环境）**  
> `operationId`: PaymentController_mockSuccess  
> 🌐 公开  

**请求体**: `application/json`

```
$ref: #/components/schemas/MockPaySuccessDto
```
> 详见 [DTO: MockPaySuccessDto](#dto-mockpaysuccessdto)

**DTO:** MockPaySuccessDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `orderNo` | string | 是 | - | - |
| `amount` | number | 否 | - | - |


**响应**:

- `201`: 

---

## 文件管理

### POST `/api/files/upload`

> **上传单个文件**  
> `operationId`: FileController_upload  
> 🔒 需认证  

**响应**:

- `201`: 

---

### POST `/api/files/upload-multiple`

> **上传多个文件**  
> `operationId`: FileController_uploadMultiple  
> 🔒 需认证  

**响应**:

- `201`: 

---

### GET `/api/files/{name}`

> **获取文件（需登录）**  
> `operationId`: FileController_getFile  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `name` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

## 报修

### GET `/api/repairs`

> **报修工单列表**  
> `operationId`: RepairController_findAll  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `page` | query | number | 否 | - | 1 |
| `pageSize` | query | number | 否 | - | 20 |
| `projectId` | query | string | 否 | - | - |
| `status` | query | string | 否 | - | - |
| `category` | query | string | 否 | - | - |
| `keyword` | query | string | 否 | - | - |

**响应**:

- `200`: 

---

### POST `/api/repairs`

> **租户提交报修**  
> `operationId`: RepairController_create  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateRepairOrderDto
```
> 详见 [DTO: CreateRepairOrderDto](#dto-createrepairorderdto)

**DTO:** CreateRepairOrderDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `projectId` | string | 是 | - | - |
| `category` | string | 是 | 报修类别，如水电、空调、门窗等 | - |
| `description` | string | 是 | - | - |
| `attachments` | string | 否 | 附件 JSON 数组字符串 | - |


**响应**:

- `201`: 

---

### GET `/api/repairs/{id}`

> **报修工单详情**  
> `operationId`: RepairController_findOne  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### PATCH `/api/repairs/{id}`

> **修改报修工单**  
> `operationId`: RepairController_update  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/UpdateRepairOrderDto
```
> 详见 [DTO: UpdateRepairOrderDto](#dto-updaterepairorderdto)

**DTO:** UpdateRepairOrderDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `category` | string | 否 | - | - |
| `description` | string | 否 | - | - |
| `attachments` | string | 否 | - | - |


**响应**:

- `200`: 

---

### DELETE `/api/repairs/{id}`

> **取消/删除报修工单**  
> `operationId`: RepairController_remove  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### POST `/api/repairs/{id}/assign`

> **分配工程师**  
> `operationId`: RepairController_assign  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/AssignRepairDto
```
> 详见 [DTO: AssignRepairDto](#dto-assignrepairdto)

**DTO:** AssignRepairDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `assigneeId` | string | 是 | 工程师 SysUser ID | - |
| `remark` | string | 否 | - | - |


**响应**:

- `201`: 

---

### POST `/api/repairs/{id}/progress`

> **更新处理进度**  
> `operationId`: RepairController_addProgress  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateRepairProgressDto
```
> 详见 [DTO: CreateRepairProgressDto](#dto-createrepairprogressdto)

**DTO:** CreateRepairProgressDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `content` | string | 是 | - | - |
| `attachments` | string | 否 | - | - |


**响应**:

- `201`: 

---

### POST `/api/repairs/{id}/complete`

> **完成工单**  
> `operationId`: RepairController_complete  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateRepairProgressDto
```
**DTO:** CreateRepairProgressDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `content` | string | 是 | - | - |
| `attachments` | string | 否 | - | - |

**响应**:

- `201`: 

---

### GET `/api/repairs/{id}/messages`

> **工单消息列表**  
> `operationId`: RepairController_listMessages  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### POST `/api/repairs/{id}/messages`

> **发送工单消息**  
> `operationId`: RepairController_addMessage  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateRepairMessageDto
```
> 详见 [DTO: CreateRepairMessageDto](#dto-createrepairmessagedto)

**DTO:** CreateRepairMessageDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `content` | string | 是 | - | - |


**响应**:

- `201`: 

---

### POST `/api/repairs/{id}/rating`

> **工单评价**  
> `operationId`: RepairController_rate  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateRepairRatingDto
```
> 详见 [DTO: CreateRepairRatingDto](#dto-createrepairratingdto)

**DTO:** CreateRepairRatingDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `speedScore` | number | 是 | - | - |
| `qualityScore` | number | 是 | - | - |
| `comment` | string | 否 | - | - |


**响应**:

- `201`: 

---

## 系统

### GET `/api/system/audit-logs`

> **审计日志查询**  
> `operationId`: SystemController_queryAuditLogs  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `page` | query | number | 否 | - | 1 |
| `pageSize` | query | number | 否 | - | 20 |
| `module` | query | string | 否 | - | - |
| `action` | query | string | 否 | - | - |
| `userId` | query | string | 否 | - | - |
| `companyId` | query | string | 否 | - | - |
| `projectId` | query | string | 否 | - | - |
| `targetId` | query | string | 否 | - | - |
| `startDate` | query | string | 否 | - | - |
| `endDate` | query | string | 否 | - | - |
| `keyword` | query | string | 否 | - | - |

**响应**:

- `200`: 

---

## 投诉

### GET `/api/complaints`

> **投诉列表**  
> `operationId`: ComplaintController_findAll  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `page` | query | number | 否 | - | 1 |
| `pageSize` | query | number | 否 | - | 20 |
| `projectId` | query | string | 否 | - | - |
| `status` | query | string | 否 | - | - |
| `targetType` | query | string | 否 | - | - |
| `keyword` | query | string | 否 | - | - |

**响应**:

- `200`: 

---

### POST `/api/complaints`

> **租户提交投诉**  
> `operationId`: ComplaintController_create  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateComplaintDto
```
> 详见 [DTO: CreateComplaintDto](#dto-createcomplaintdto)

**DTO:** CreateComplaintDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `projectId` | string | 是 | - | - |
| `targetType` | string (`PROJECT`, `STAFF`, `EVENT`) | 是 | - | - |
| `targetId` | string | 否 | - | - |
| `targetName` | string | 否 | - | - |
| `title` | string | 是 | - | - |
| `content` | string | 是 | - | - |


**响应**:

- `201`: 

---

### GET `/api/complaints/{id}`

> **投诉详情**  
> `operationId`: ComplaintController_findOne  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### POST `/api/complaints/{id}/analysis`

> **运营创建/更新投诉分析**  
> `operationId`: ComplaintController_createAnalysis  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateComplaintAnalysisDto
```
> 详见 [DTO: CreateComplaintAnalysisDto](#dto-createcomplaintanalysisdto)

**DTO:** CreateComplaintAnalysisDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `conclusion` | string | 是 | - | - |
| `evaluation` | string | 否 | - | - |
| `verified` | boolean | 否 | - | False |


**响应**:

- `201`: 

---

### POST `/api/complaints/{id}/appeals`

> **员工提交申诉**  
> `operationId`: ComplaintController_createAppeal  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateComplaintAppealDto
```
> 详见 [DTO: CreateComplaintAppealDto](#dto-createcomplaintappealdto)

**DTO:** CreateComplaintAppealDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `content` | string | 是 | - | - |


**响应**:

- `201`: 

---

### POST `/api/complaints/{id}/appeals/{appealId}/resolve`

> **运营处理申诉**  
> `operationId`: ComplaintController_resolveAppeal  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |
| `appealId` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/ResolveComplaintAppealDto
```
> 详见 [DTO: ResolveComplaintAppealDto](#dto-resolvecomplaintappealdto)

**DTO:** ResolveComplaintAppealDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `result` | string | 是 | - | - |
| `status` | string (`ACCEPTED`, `REJECTED`) | 否 | - | - |


**响应**:

- `201`: 

---

### POST `/api/complaints/{id}/close`

> **关闭投诉**  
> `operationId`: ComplaintController_close  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/CloseComplaintDto
```
> 详见 [DTO: CloseComplaintDto](#dto-closecomplaintdto)

**DTO:** CloseComplaintDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `remark` | string | 否 | - | - |


**响应**:

- `201`: 

---

## 消息与公告

### GET `/api/announcements`

> **公告列表（按项目）**  
> `operationId`: NotificationController_findAnnouncements  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `page` | query | number | 否 | - | 1 |
| `pageSize` | query | number | 否 | - | 20 |
| `projectId` | query | string | 否 | - | - |
| `status` | query | number | 否 | - | - |
| `keyword` | query | string | 否 | - | - |

**响应**:

- `200`: 

---

### POST `/api/announcements`

> **创建公告**  
> `operationId`: NotificationController_createAnnouncement  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/CreateAnnouncementDto
```
> 详见 [DTO: CreateAnnouncementDto](#dto-createannouncementdto)

**DTO:** CreateAnnouncementDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `projectId` | string | 是 | - | - |
| `title` | string | 是 | - | - |
| `content` | string | 是 | - | - |
| `status` | number | 否 | - | 1 |
| `publish` | boolean | 否 | 是否立即发布 | - |


**响应**:

- `201`: 

---

### GET `/api/announcements/{id}`

> **公告详情**  
> `operationId`: NotificationController_findAnnouncement  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### PATCH `/api/announcements/{id}`

> **更新公告**  
> `operationId`: NotificationController_updateAnnouncement  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**请求体**: `application/json`

```
$ref: #/components/schemas/UpdateAnnouncementDto
```
> 详见 [DTO: UpdateAnnouncementDto](#dto-updateannouncementdto)

**DTO:** UpdateAnnouncementDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `title` | string | 否 | - | - |
| `content` | string | 否 | - | - |
| `status` | number | 否 | - | - |
| `publish` | boolean | 否 | - | - |


**响应**:

- `200`: 

---

### DELETE `/api/announcements/{id}`

> **删除公告**  
> `operationId`: NotificationController_removeAnnouncement  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

### GET `/api/notifications`

> **我的通知列表**  
> `operationId`: NotificationController_findNotifications  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `page` | query | number | 否 | - | 1 |
| `pageSize` | query | number | 否 | - | 20 |
| `read` | query | boolean | 否 | - | - |
| `type` | query | string | 否 | - | - |

**响应**:

- `200`: 

---

### PATCH `/api/notifications/read-all`

> **全部标记已读**  
> `operationId`: NotificationController_markAllRead  
> 🔒 需认证  

**响应**:

- `200`: 

---

### PATCH `/api/notifications/read`

> **批量标记已读**  
> `operationId`: NotificationController_markBatchRead  
> 🔒 需认证  

**请求体**: `application/json`

```
$ref: #/components/schemas/MarkNotificationsReadDto
```
> 详见 [DTO: MarkNotificationsReadDto](#dto-marknotificationsreaddto)

**DTO:** MarkNotificationsReadDto

**类型**: object

| 字段 | 类型 | 必填 | 描述 | 默认值 |
|------|------|------|------|--------|
| `ids` | array<string> | 是 | - | - |


**响应**:

- `200`: 

---

### PATCH `/api/notifications/{id}/read`

> **标记单条已读**  
> `operationId`: NotificationController_markRead  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `id` | path | string | 是 | - | - |

**响应**:

- `200`: 

---

## 仪表盘

### GET `/api/dashboard/overview`

> **运营概览指标**  
> `operationId`: DashboardController_getOverview  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `projectId` | query | string | 否 | 项目 ID，不传则按数据权限汇总 | - |

**响应**:

- `200`: 

---

### GET `/api/dashboard/tenant-home`

> **租户端首页概览**  
> `operationId`: DashboardController_getTenantHome  
> 🔒 需认证  

**响应**:

- `200`: 

---

## 报表

### GET `/api/reports/financial/rent-income`

> **租金收入报表**  
> `operationId`: ReportController_rentIncome  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `projectId` | query | string | 否 | - | - |
| `startDate` | query | string | 否 | 开始日期 YYYY-MM-DD | - |
| `endDate` | query | string | 否 | 结束日期 YYYY-MM-DD | - |
| `export` | query | boolean | 否 | 是否导出 Excel | - |

**响应**:

- `200`: 

---

### GET `/api/reports/financial/collection-rate`

> **收缴率报表**  
> `operationId`: ReportController_collectionRate  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `projectId` | query | string | 否 | - | - |
| `startDate` | query | string | 否 | 开始日期 YYYY-MM-DD | - |
| `endDate` | query | string | 否 | 结束日期 YYYY-MM-DD | - |
| `export` | query | boolean | 否 | 是否导出 Excel | - |

**响应**:

- `200`: 

---

### GET `/api/reports/financial/overdue-detail`

> **欠费明细报表**  
> `operationId`: ReportController_overdueDetail  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `projectId` | query | string | 否 | - | - |
| `startDate` | query | string | 否 | 开始日期 YYYY-MM-DD | - |
| `endDate` | query | string | 否 | 结束日期 YYYY-MM-DD | - |
| `export` | query | boolean | 否 | 是否导出 Excel | - |
| `overdueOnly` | query | boolean | 否 | 仅统计已标记逾期的账单 | - |

**响应**:

- `200`: 

---

### GET `/api/reports/operational/repair-analysis`

> **报修分析报表**  
> `operationId`: ReportController_repairAnalysis  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `projectId` | query | string | 否 | - | - |
| `startDate` | query | string | 否 | 开始日期 YYYY-MM-DD | - |
| `endDate` | query | string | 否 | 结束日期 YYYY-MM-DD | - |
| `export` | query | boolean | 否 | 是否导出 Excel | - |

**响应**:

- `200`: 

---

### GET `/api/reports/operational/satisfaction`

> **满意度报表**  
> `operationId`: ReportController_satisfaction  
> 🔒 需认证  

**参数**:

| 参数名 | 位置 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|------|--------|
| `projectId` | query | string | 否 | - | - |
| `startDate` | query | string | 否 | 开始日期 YYYY-MM-DD | - |
| `endDate` | query | string | 否 | 结束日期 YYYY-MM-DD | - |
| `export` | query | boolean | 否 | 是否导出 Excel | - |

**响应**:

- `200`: 

---
