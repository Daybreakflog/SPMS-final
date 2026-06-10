import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { companyHandlers } from '@/mocks/handlers/company';

const BASE = 'http://localhost';

// Re-host the relative-path handlers onto an absolute base so msw/node matches them.
const rehosted = companyHandlers.map((h) => {
  const info = (h as unknown as { info: { method: string; path: string } }).info;
  const absolute = `${BASE}${info.path}`;
  const method = info.method.toLowerCase() as 'get' | 'post' | 'patch' | 'delete';
  return http[method](absolute, (h as unknown as { resolver: Parameters<typeof http.get>[1] }).resolver);
});

const server = setupServer(...rehosted);
void HttpResponse;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

async function json(res: Response) {
  return { status: res.status, body: await res.json().catch(() => null) };
}

describe('platform/companies endpoint probe (MSW)', () => {
  let createdId = '';

  it('GET /api/platform/companies — 分页查询', async () => {
    const r = await fetch(`${BASE}/api/platform/companies?page=1&pageSize=5`);
    const { status, body } = await json(r);
    console.log('[LIST]', status, body);
    expect(status).toBe(200);
    expect(body).toMatchObject({ page: 1, pageSize: 5 });
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeLessThanOrEqual(5);
    expect(body.total).toBeGreaterThan(0);
  });

  it('POST /api/platform/companies — 创建公司', async () => {
    const r = await fetch(`${BASE}/api/platform/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '探针测试物业',
        code: 'PROBE001',
        contact: '探针',
        phone: '13800000000',
        email: 'probe@test.com',
        address: '测试地址 1 号',
      }),
    });
    const { status, body } = await json(r);
    console.log('[CREATE]', status, body);
    expect(status).toBe(201);
    expect(body.id).toMatch(/^company-/);
    expect(body.name).toBe('探针测试物业');
    // 后端 status 为数字：1 启用 / 0 禁用
    expect(body.status).toBe(1);
    createdId = body.id;
  });

  it('GET /api/platform/companies/:id — 详情', async () => {
    const r = await fetch(`${BASE}/api/platform/companies/${createdId}`);
    const { status, body } = await json(r);
    console.log('[DETAIL]', status, body);
    expect(status).toBe(200);
    expect(body.id).toBe(createdId);
    expect(body.code).toBe('PROBE001');
  });

  it('PATCH /api/platform/companies/:id — 更新', async () => {
    const r = await fetch(`${BASE}/api/platform/companies/${createdId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '探针测试物业(已更名)', status: 0 }),
    });
    const { status, body } = await json(r);
    console.log('[UPDATE]', status, body);
    expect(status).toBe(200);
    expect(body.name).toBe('探针测试物业(已更名)');
    expect(body.status).toBe(0);
  });

  it('DELETE /api/platform/companies/:id — 删除', async () => {
    const r = await fetch(`${BASE}/api/platform/companies/${createdId}`, {
      method: 'DELETE',
    });
    console.log('[DELETE]', r.status);
    expect(r.status).toBe(200);

    const after = await fetch(`${BASE}/api/platform/companies/${createdId}`);
    const { status, body } = await json(after);
    console.log('[DETAIL after delete]', status, body);
    expect(status).toBe(404);
  });

  it('详情 404 — 不存在的 id', async () => {
    const r = await fetch(`${BASE}/api/platform/companies/does-not-exist`);
    const { status, body } = await json(r);
    console.log('[DETAIL 404]', status, body);
    expect(status).toBe(404);
    expect(body.message).toBe('公司不存在');
  });
});
