import type { Collection, Content, Inquiry, InquiryInput, InquiryStatus, MailInfo, Role, Settings, User, UserStatus } from './types';

const TOKEN_KEY = 'hima_admin_token';

export const token = {
  get(): string | null {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set(v: string): void {
    try { localStorage.setItem(TOKEN_KEY, v); } catch { /* bỏ qua */ }
  },
  clear(): void {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* bỏ qua */ }
  },
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface Init extends RequestInit { auth?: boolean }

async function request<T>(path: string, init: Init = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.auth) {
    const t = token.get();
    if (t) headers.set('Authorization', `Bearer ${t}`);
  }
  if (typeof init.body === 'string' && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers });
  } catch {
    throw new ApiError(0, 'Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && init.auth) {
      token.clear();
      window.dispatchEvent(new Event('hima-logout'));
    }
    throw new ApiError(res.status, data?.error ?? 'Có lỗi xảy ra, vui lòng thử lại.');
  }
  return data as T;
}

const body = (method: string, payload: unknown): Init => ({ method, body: JSON.stringify(payload) });

export interface Summary {
  photos: number; videos: number; packages: number; testimonials: number;
  inquiries: number; newInquiries: number; latest: Inquiry[];
}

export const api = {
  content: () => request<Content>('/api/content'),
  sendInquiry: (b: InquiryInput) => request<{ ok: true }>('/api/inquiries', body('POST', b)),
  authConfig: () => request<{ googleClientId: string; allowRegister: boolean }>('/api/auth/config'),
  login: (login: string, password: string) => request<{ token: string; user: User }>('/api/auth/login', body('POST', { login, password })),
  register: (b: { name: string; email: string; password: string; website?: string }) =>
    request<{ ok: true; message: string }>('/api/auth/register', body('POST', b)),
  google: (credential: string) => request<{ token: string; user: User }>('/api/auth/google', body('POST', { credential })),

  admin: {
    me: () => request<{ user: User; defaultPassword: boolean; mail: MailInfo }>('/api/admin/me', { auth: true }),
    testMail: () => request<{ status: 'sent' | 'skipped' | 'failed'; to: string; error?: string }>('/api/admin/mail/test', { ...body('POST', {}), auth: true }),
    saveProfile: (name: string) => request<User>('/api/admin/profile', { ...body('PUT', { name }), auth: true }),
    users: () => request<User[]>('/api/admin/users', { auth: true }),
    createUser: (b: { name: string; email: string; username?: string; password: string; role: Role; status?: UserStatus; templates: string[] }) =>
      request<User>('/api/admin/users', { ...body('POST', b), auth: true }),
    updateUser: (id: string, b: Partial<{ name: string; email: string; password: string; role: Role; status: UserStatus; templates: string[] }>) =>
      request<User>(`/api/admin/users/${id}`, { ...body('PUT', b), auth: true }),
    deleteUser: (id: string) => request<{ ok: true }>(`/api/admin/users/${id}`, { method: 'DELETE', auth: true }),
    summary: () => request<Summary>('/api/admin/summary', { auth: true }),
    inquiries: () => request<Inquiry[]>('/api/admin/inquiries', { auth: true }),
    setInquiryStatus: (id: string, status: InquiryStatus) =>
      request<Inquiry>(`/api/admin/inquiries/${id}`, { ...body('PATCH', { status }), auth: true }),
    deleteInquiry: (id: string) => request<{ ok: true }>(`/api/admin/inquiries/${id}`, { method: 'DELETE', auth: true }),
    saveSettings: (s: Settings) => request<Settings>('/api/admin/settings', { ...body('PUT', s), auth: true }),
    changePassword: (current: string, next: string) =>
      request<{ token: string }>('/api/admin/password', { ...body('POST', { current, next }), auth: true }),
    create: <T>(col: Collection, data: object) => request<T>(`/api/admin/${col}`, { ...body('POST', data), auth: true }),
    update: <T>(col: Collection, id: string, data: object) =>
      request<T>(`/api/admin/${col}/${id}`, { ...body('PUT', data), auth: true }),
    remove: (col: Collection, id: string) => request<{ ok: true }>(`/api/admin/${col}/${id}`, { method: 'DELETE', auth: true }),
    reorder: (col: Collection, ids: string[]) =>
      request<unknown>(`/api/admin/${col}/reorder`, { ...body('POST', { ids }), auth: true }),
    upload: (blob: Blob) =>
      request<{ url: string }>('/api/admin/upload', {
        method: 'POST', body: blob, headers: { 'Content-Type': blob.type }, auth: true,
      }),
  },
};
