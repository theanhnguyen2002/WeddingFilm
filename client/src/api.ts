import type { Content, InquiryInput } from './types';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (typeof init.body === 'string' && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers });
  } catch {
    throw new ApiError(0, 'Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error ?? 'Có lỗi xảy ra, vui lòng thử lại.');
  return data as T;
}

export const api = {
  content: () => request<Content>('/api/content'),
  sendInquiry: (b: InquiryInput) =>
    request<{ ok: true }>('/api/inquiries', { method: 'POST', body: JSON.stringify(b) }),
};
