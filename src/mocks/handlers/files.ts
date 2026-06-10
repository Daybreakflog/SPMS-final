import { http, HttpResponse } from 'msw';

let seq = 0;

export const fileHandlers = [
  // POST /api/files/upload — 单文件
  http.post('/api/files/upload', async ({ request }) => {
    let name = 'file';
    try {
      const form = await request.formData();
      const file = form.get('file');
      if (file && file instanceof File) name = file.name;
    } catch {
      // 非 multipart，忽略
    }
    seq += 1;
    return HttpResponse.json({ url: `/api/files/${Date.now()}-${seq}-${name}`, name });
  }),

  // POST /api/files/upload-multiple — 多文件
  http.post('/api/files/upload-multiple', async ({ request }) => {
    const results: Array<{ url: string; name: string }> = [];
    try {
      const form = await request.formData();
      const files = form.getAll('file');
      files.forEach((f) => {
        const name = f instanceof File ? f.name : 'file';
        seq += 1;
        results.push({ url: `/api/files/${Date.now()}-${seq}-${name}`, name });
      });
    } catch {
      // ignore
    }
    return HttpResponse.json(results);
  }),

  // GET /api/files/:name — 文件下载/预览
  http.get('/api/files/:name', ({ params }) => {
    const name = params.name as string;
    return new Response(`mock-file-content:${name}`, {
      headers: { 'Content-Type': 'application/octet-stream', 'Content-Disposition': `inline; filename="${name}"` },
    });
  }),
];
