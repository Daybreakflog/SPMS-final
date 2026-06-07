import request from './request';

interface UploadResult {
  url: string;
  name: string;
}

export function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  return request.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function uploadMultipleFiles(files: File[]): Promise<UploadResult[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append('file', f));
  return request.post('/files/upload-multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function getFileUrl(name: string): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? '/api';
  return `${base}/files/${name}`;
}
