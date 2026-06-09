# SETTINGS_FIX_REPORT — 系统设置假功能修复报告

## 背景

审计项 **C-01 / H-01**：`settingService` 全部方法返回 `Promise.resolve(DEFAULT_SETTING)`，页面上点击保存永远 toast「保存成功」，存在严重的"假成功"误导。

## 修改文件

### `src/services/setting.service.ts`

- 删除所有 `Promise.resolve(DEFAULT_SETTING)` 假实现。
- 改为统一通过 `http`（封装好的 axios）真实发起请求。
- 新增 `SETTINGS_API_ENABLED` 开关（读环境变量 `VITE_SYSTEM_SETTINGS_ENABLED`）。
- 新增 `ensureEnabled()`：在非 DEV 且未开启的情况下抛出 `Error("System settings API not implemented")`，禁止任何假成功。
- 导出 `isSystemSettingsApiEnabled()` 给页面查询能力开关。

```ts
// 旧
get: () => Promise.resolve(DEFAULT_SETTING)
updateBasic: (_data) => Promise.resolve(DEFAULT_SETTING)
...

// 新
get: () => { ensureEnabled(); return http.get<SystemSetting>('/system/settings'); }
updateBasic: (data) => { ensureEnabled(); return http.patch<SystemSetting>('/system/settings/basic', data); }
...
```

### `src/pages/system/settings/index.tsx`

- 新增 `apiEnabled = isSystemSettingsApiEnabled()`。
- 顶部加 `<Alert type="warning">`：API 不可用时显式提示「系统设置接口暂未开放」。
- 加载失败时显式提示「加载系统设置失败」`<Alert type="error">`。
- 所有 `useMutation` 增加 `onError` 显示 `message.error(...)`。**保存失败必须可见**。
- 所有保存按钮在 `apiEnabled === false` 时 `disabled`，杜绝点击触发假成功。
- `useQuery` 关闭 `retry`，并通过 `enabled: apiEnabled` 控制是否真正触发。

## 行为对比

| 场景 | 修复前 | 修复后 |
|------|--------|--------|
| 后端未实现 | 总是 toast 成功 | 顶部黄色 Alert + 保存按钮 disabled |
| 后端实现 + 成功 | toast 成功 | 同左 |
| 后端实现 + 失败 | 静默忽略 | 红色 `message.error(...)` |

## 风险说明

- 生产开启该页面需后端实现下列 4 个接口：
  - `GET /api/system/settings`
  - `PATCH /api/system/settings/basic`
  - `PATCH /api/system/settings/notification`
  - `PATCH /api/system/settings/security`
- 开启后还需设置 `VITE_SYSTEM_SETTINGS_ENABLED=true`。
- 开发环境（`import.meta.env.DEV === true`）默认仍可访问 MSW Mock，确保 UI 联调不受影响。
