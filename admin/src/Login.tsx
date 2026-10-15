import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, token } from './api';
import { AdminBrand } from './Brand';
import type { Settings } from './types';
import { Btn, Field, errMsg, input } from './ui';
import { toast } from 'sonner';

interface GoogleId {
  initialize: (o: { client_id: string; callback: (r: { credential: string }) => void }) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
}
declare global { interface Window { google?: { accounts: { id: GoogleId } } } }

const GIS = 'https://accounts.google.com/gsi/client';

function GoogleButton({ clientId, onCredential }: { clientId: string; onCredential: (c: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const cb = useRef(onCredential);
  cb.current = onCredential;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let dead = false;
    const draw = () => {
      if (dead || !box.current || !window.google) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: (r) => cb.current(r.credential) });
      window.google.accounts.id.renderButton(box.current, { theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', width: 304, locale: 'vi' });
    };
    if (window.google) { draw(); return () => { dead = true; }; }
    const s = document.createElement('script');
    s.src = GIS; s.async = true; s.defer = true;
    s.onload = draw;
    s.onerror = () => setFailed(true);
    document.head.appendChild(s);
    return () => { dead = true; };
  }, [clientId]);

  if (failed) return <p className="text-center text-xs text-mute">Không tải được nút Google. Bạn kiểm tra mạng rồi tải lại trang nhé.</p>;
  return <div ref={box} className="flex min-h-[44px] justify-center" />;
}

export function Login({ onDone, brand }: { onDone: () => void; brand: Settings | null }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [cfg, setCfg] = useState<{ googleClientId: string; allowRegister: boolean }>({ googleClientId: '', allowRegister: false });
  const [login, setLogin] = useState('');
  const [pw, setPw] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.authConfig().then(setCfg).catch(() => {}); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') {
        const { token: t } = await api.login(login, pw);
        token.set(t);
        onDone();
      } else {
        const r = await api.register({ name, email, password: pw, website: trap });
        toast.success(r.message);
        setMode('login');
        setLogin(email);
        setPw('');
      }
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  async function google(credential: string) {
    setError('');
    try {
      const r = (await api.google(credential)) as { token?: string; error?: string };
      // Máy chủ trả 202 kèm lời nhắn khi vừa tạo tài khoản chờ duyệt: đó là thông báo, không phải lỗi.
      if (!r.token) { toast.info(r.error || 'Tài khoản đang chờ quản trị viên duyệt.', { duration: 8000 }); return; }
      token.set(r.token);
      onDone();
    } catch (err) {
      setError(errMsg(err));
    }
  }

  const register = mode === 'register';

  return (
    <div className="grid min-h-screen place-items-center bg-night px-5 py-10">
      <form onSubmit={submit} className="w-full max-w-sm bg-snow p-8">
        <AdminBrand settings={brand} onDark={false} textClass="text-4xl" imgClass="h-14" />
        <p className="mb-6 mt-1 text-[11px] uppercase tracking-[0.3em] text-mute">Trang quản trị</p>

        {cfg.allowRegister && (
          <div className="mb-6 grid grid-cols-2 border border-line text-sm" role="tablist">
            {(['login', 'register'] as const).map((m) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setError(''); }}
                className={`py-2 transition ${mode === m ? 'bg-ink text-white' : 'bg-white text-mute hover:text-ink'}`}>
                {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {register && <Field label="Tên của bạn"><input className={input} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></Field>}
          {register
            ? <Field label="Email"><input type="email" className={input} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            : <Field label="Tên đăng nhập hoặc email"><input autoFocus className={input} autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} /></Field>}
          <Field label="Mật khẩu" hint={register ? 'Ít nhất 8 ký tự.' : undefined}>
            <input type="password" className={input} autoComplete={register ? 'new-password' : 'current-password'} value={pw} onChange={(e) => setPw(e.target.value)} />
          </Field>
          {register && <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" name="website" value={trap} onChange={(e) => setTrap(e.target.value)} />}
        </div>
        {error && <p className="mt-3 text-sm text-claret" role="alert">{error}</p>}
        <Btn type="submit" className="mt-6 w-full" disabled={busy || !pw || (register ? !email || !name : !login)}>
          {busy ? 'Đang xử lý...' : register ? 'Gửi đăng ký' : 'Đăng nhập'}
        </Btn>
        {register && <p className="mt-3 text-xs text-mute">Tài khoản mới cần quản trị viên duyệt trước khi dùng được.</p>}

        {cfg.googleClientId && (
          <>
            <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-mute"><span className="h-px flex-1 bg-line" />hoặc<span className="h-px flex-1 bg-line" /></div>
            <GoogleButton clientId={cfg.googleClientId} onCredential={google} />
          </>
        )}
        <a href="/" className="mt-6 block text-center text-xs text-mute hover:text-ink">Về trang chủ</a>
      </form>
    </div>
  );
}
