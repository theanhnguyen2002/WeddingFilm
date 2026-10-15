import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, token } from './api';
import { formatDateTime } from './format';
import type { Role, TemplateMeta, User, UserStatus } from './types';
import { Btn, Field, errMsg, input, type Notify } from './ui';

export const ROLE_LABEL: Record<Role, string> = { admin: 'Quản trị viên', member: 'Hội viên' };
const ROLE_HINT: Record<Role, string> = {
  admin: 'Toàn quyền: quản lý tài khoản, dùng mọi giao diện, sửa mọi nội dung.',
  member: 'Chỉ dùng và làm việc trên đúng một giao diện được phân. Chưa được phân giao diện thì chỉ xem.',
};
const STATUS_LABEL: Record<UserStatus, string> = { active: 'Đang hoạt động', pending: 'Chờ duyệt', disabled: 'Đã khoá' };
const STATUS_CLS: Record<UserStatus, string> = { active: 'bg-emerald-700 text-white', pending: 'bg-claret text-white', disabled: 'bg-line text-mute' };

export function Avatar({ user, size = 'h-9 w-9' }: { user: Pick<User, 'name' | 'picture'>; size?: string }) {
  const [bad, setBad] = useState(false);
  if (user.picture && !bad) return <img src={user.picture} alt="" referrerPolicy="no-referrer" onError={() => setBad(true)} className={`${size} shrink-0 rounded-full object-cover`} />;
  return <span className={`${size} grid shrink-0 place-items-center rounded-full bg-claret text-sm font-medium text-white`}>{(user.name || '?').trim().charAt(0).toUpperCase()}</span>;
}

/* ---------------- Tài khoản của tôi ---------------- */
export function MyAccount({ me, defaultPassword, onUser, onPasswordChanged, notify }: {
  me: User; defaultPassword: boolean; onUser: (u: User) => void; onPasswordChanged: () => void; notify: Notify;
}) {
  const [name, setName] = useState(me.name);
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);

  async function saveName(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try { onUser(await api.admin.saveProfile(name)); notify('Đã lưu tên hiển thị'); } catch (err) { notify(errMsg(err), 'err'); } finally { setBusy(false); }
  }
  async function savePw(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { token: t } = await api.admin.changePassword(cur, next);
      token.set(t);
      setCur(''); setNext('');
      onPasswordChanged();
      notify('Đã đổi mật khẩu');
    } catch (err) { notify(errMsg(err), 'err'); } finally { setBusy(false); }
  }

  return (
    <div className="space-y-8">
      {defaultPassword && <p className="border border-claret/40 bg-claret/5 p-4 text-sm"><strong>Bạn đang dùng mật khẩu mặc định.</strong> Hãy đổi ngay bên dưới trước khi đưa website lên mạng.</p>}
      <section className="flex flex-wrap items-center gap-5 border border-line bg-white p-6">
        <Avatar user={me} size="h-16 w-16" />
        <div className="min-w-0">
          <p className="text-lg font-medium">{me.name}</p>
          <p className="truncate text-sm text-mute">{me.email || me.username}</p>
          <p className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-night px-3 py-1 text-white">{ROLE_LABEL[me.role]}</span>
            {me.google && <span className="rounded-full border border-line px-3 py-1 text-mute">Đã liên kết Google</span>}
          </p>
        </div>
      </section>
      <form onSubmit={saveName} className="max-w-xl space-y-4 border border-line bg-white p-6">
        <h2 className="font-display text-2xl font-light italic">Thông tin hiển thị</h2>
        <Field label="Tên hiển thị"><input className={input} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Btn type="submit" disabled={busy || !name.trim() || name === me.name}>Lưu tên</Btn>
      </form>
      <form onSubmit={savePw} className="grid max-w-xl gap-4 border border-line bg-white p-6 sm:grid-cols-2">
        <h2 className="font-display text-2xl font-light italic sm:col-span-2">{me.hasPassword ? 'Đổi mật khẩu' : 'Tạo mật khẩu'}</h2>
        {!me.hasPassword && <p className="text-xs text-mute sm:col-span-2">Tài khoản này đăng nhập bằng Google. Tạo mật khẩu nếu bạn muốn đăng nhập bằng email nữa.</p>}
        {me.hasPassword && <Field label="Mật khẩu hiện tại"><input type="password" autoComplete="current-password" className={input} value={cur} onChange={(e) => setCur(e.target.value)} /></Field>}
        <Field label="Mật khẩu mới" hint="Ít nhất 8 ký tự."><input type="password" autoComplete="new-password" className={input} value={next} onChange={(e) => setNext(e.target.value)} /></Field>
        <div className="sm:col-span-2"><Btn type="submit" disabled={busy || (me.hasPassword && !cur) || next.length < 8}>{me.hasPassword ? 'Đổi mật khẩu' : 'Tạo mật khẩu'}</Btn></div>
      </form>
    </div>
  );
}

/* ---------------- Quản lý tài khoản (quản trị viên) ---------------- */
function TemplateGrants({ templates, value, onChange }: { templates: TemplateMeta[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-medium">Giao diện được phân cho hội viên (chọn một)</legend>
      <div className="flex flex-wrap gap-2">
        {templates.map((t) => {
          const on = value.includes(t.id);
          return (
            <label key={t.id} className={`flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-sm transition ${on ? 'border-claret bg-claret/5' : 'border-line bg-white hover:border-ink'}`}>
              <input type="radio" name="member-template" className="h-4 w-4 accent-[var(--color-claret)]" checked={on} onChange={() => onChange([t.id])} />
              <span className="flex gap-0.5">{t.swatches.slice(0, 3).map((c) => (<i key={c} className="h-3 w-3 rounded-full border border-black/10" style={{ background: c }} />))}</span>
              {t.name}
            </label>
          );
        })}
      </div>
      {value.length === 0 && <p className="mt-2 text-xs text-claret">Chưa phân giao diện: hội viên này chỉ xem được, chưa sửa được gì.</p>}
    </fieldset>
  );
}

function RoleSelect({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <Field label="Vai trò" hint={ROLE_HINT[value]}>
      <select className={input} value={value} onChange={(e) => onChange(e.target.value as Role)}>
        {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (<option key={r} value={r}>{ROLE_LABEL[r]}</option>))}
      </select>
    </Field>
  );
}

function UserRow({ user, me, templates, notify, onChanged }: { user: User; me: User; templates: TemplateMeta[]; notify: Notify; onChanged: () => void }) {
  const [open, setOpen] = useState(user.status === 'pending');
  const [role, setRole] = useState<Role>(user.role);
  const [status, setStatus] = useState<UserStatus>(user.status);
  const [grants, setGrants] = useState<string[]>(user.templates);
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const self = user.id === me.id;

  async function save(patch?: Partial<{ status: UserStatus }>) {
    setBusy(true);
    try {
      await api.admin.updateUser(user.id, { name, role, status: patch?.status ?? status, templates: grants, ...(pw ? { password: pw } : {}) });
      setPw('');
      notify(patch?.status === 'active' && user.status === 'pending' ? 'Đã duyệt tài khoản' : 'Đã lưu tài khoản');
      onChanged();
    } catch (e) { notify(errMsg(e), 'err'); } finally { setBusy(false); }
  }
  async function remove() {
    if (!window.confirm(`Xoá tài khoản ${user.name}? Người này sẽ không đăng nhập được nữa.`)) return;
    try { await api.admin.deleteUser(user.id); notify('Đã xoá tài khoản'); onChanged(); } catch (e) { notify(errMsg(e), 'err'); }
  }

  return (
    <li className="border border-line bg-white">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-4 px-5 py-4 text-left">
        <Avatar user={user} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{user.name}{self && <span className="ml-2 text-xs font-normal text-mute">(bạn)</span>}</span>
          <span className="block truncate text-xs text-mute">{user.email || user.username} · {ROLE_LABEL[user.role]}{user.google ? ' · Google' : ''}</span>
        </span>
        <span className={`hidden rounded-full px-3 py-1 text-xs sm:inline ${STATUS_CLS[user.status]}`}>{STATUS_LABEL[user.status]}</span>
        <span className="text-xs text-mute">{open ? 'Thu gọn' : 'Sửa'}</span>
      </button>
      {open && (
        <div className="space-y-4 border-t border-line px-5 pb-5 pt-5">
          <p className="text-xs text-mute">Tạo lúc {formatDateTime(user.createdAt)}{user.lastLoginAt ? ` · Đăng nhập gần nhất ${formatDateTime(user.lastLoginAt)}` : ' · Chưa đăng nhập lần nào'}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tên hiển thị"><input className={input} value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Trạng thái">
              <select className={input} value={status} disabled={self} onChange={(e) => setStatus(e.target.value as UserStatus)}>
                {(Object.keys(STATUS_LABEL) as UserStatus[]).map((s) => (<option key={s} value={s}>{STATUS_LABEL[s]}</option>))}
              </select>
            </Field>
            <RoleSelect value={role} onChange={setRole} />
            <Field label="Đặt lại mật khẩu" hint="Để trống nếu không đổi. Người dùng sẽ phải đăng nhập lại."><input type="password" autoComplete="new-password" className={input} value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
          </div>
          {role === 'member' && <TemplateGrants templates={templates} value={grants} onChange={setGrants} />}
          {role === 'admin' && <p className="text-xs text-mute">Quản trị viên dùng được mọi giao diện.</p>}
          <div className="flex flex-wrap gap-2">
            {user.status === 'pending' && <Btn disabled={busy} onClick={() => { setStatus('active'); void save({ status: 'active' }); }}>Duyệt tài khoản</Btn>}
            <Btn variant={user.status === 'pending' ? 'ghost' : 'primary'} disabled={busy || (pw.length > 0 && pw.length < 8)} onClick={() => save()}>Lưu</Btn>
            {!self && <Btn variant="danger" onClick={remove}>Xoá tài khoản</Btn>}
          </div>
        </div>
      )}
    </li>
  );
}

function NewUser({ templates, notify, onDone, onCancel }: { templates: TemplateMeta[]; notify: Notify; onDone: () => void; onCancel: () => void }) {
  const [f, setF] = useState({ name: '', email: '', username: '', password: '' });
  const [role, setRole] = useState<Role>('member');
  const [grants, setGrants] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.admin.createUser({ ...f, username: f.username || undefined, role, templates: grants, status: 'active' });
      notify('Đã tạo tài khoản');
      onDone();
    } catch (err) { notify(errMsg(err), 'err'); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-4 border border-ink/40 bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tên hiển thị"><input className={input} value={f.name} onChange={(e) => set('name', e.target.value)} /></Field>
        <Field label="Email" hint="Dùng để đăng nhập, và để khớp khi họ bấm đăng nhập bằng Google."><input type="email" className={input} value={f.email} onChange={(e) => set('email', e.target.value)} /></Field>
        <Field label="Tên đăng nhập (không bắt buộc)" hint="Bỏ trống thì dùng email."><input className={input} value={f.username} onChange={(e) => set('username', e.target.value)} /></Field>
        <Field label="Mật khẩu" hint="Ít nhất 8 ký tự."><input type="password" autoComplete="new-password" className={input} value={f.password} onChange={(e) => set('password', e.target.value)} /></Field>
        <RoleSelect value={role} onChange={setRole} />
      </div>
      {role === 'member' && <TemplateGrants templates={templates} value={grants} onChange={setGrants} />}
      <div className="flex gap-2">
        <Btn type="submit" disabled={busy || !(f.email || f.username) || f.password.length < 8}>Tạo tài khoản</Btn>
        <Btn variant="ghost" onClick={onCancel}>Huỷ</Btn>
      </div>
    </form>
  );
}

export function Accounts({ me, templates, notify }: { me: User; templates: TemplateMeta[]; notify: Notify }) {
  const [users, setUsers] = useState<User[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [allow, setAllow] = useState<boolean | null>(null);

  const load = useCallback(() => { api.admin.users().then(setUsers).catch((e) => notify(errMsg(e), 'err')); }, [notify]);
  useEffect(load, [load]);
  useEffect(() => { api.content().then((c) => setAllow(c.settings.allowRegister)).catch(() => {}); }, []);

  async function toggleRegister(v: boolean) {
    try {
      const c = await api.content();
      const saved = await api.admin.saveSettings({ ...c.settings, allowRegister: v });
      setAllow(saved.allowRegister);
      notify(v ? 'Đã mở đăng ký tài khoản mới' : 'Đã đóng đăng ký');
    } catch (e) { notify(errMsg(e), 'err'); }
  }

  const pending = users?.filter((u) => u.status === 'pending').length ?? 0;
  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4 border border-line bg-white p-5">
        <div className="max-w-xl">
          <p className="text-sm font-medium">Cho phép người lạ tự đăng ký</p>
          <p className="mt-1 text-xs text-mute">Khi bật, màn đăng nhập có thêm tab Đăng ký và nút Google tự tạo tài khoản. Mọi tài khoản mới đều ở trạng thái Chờ duyệt, là hội viên chưa có giao diện, cho đến khi bạn duyệt và phân giao diện.</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-[var(--color-claret)]" disabled={allow === null} checked={Boolean(allow)} onChange={(e) => toggleRegister(e.target.checked)} />
          {allow ? 'Đang mở' : 'Đang đóng'}
        </label>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-mute">{users ? `${users.length} tài khoản` : 'Đang tải...'}{pending > 0 && <strong className="ml-2 text-claret">{pending} đang chờ duyệt</strong>}</p>
        {!adding && <Btn onClick={() => setAdding(true)}>Thêm tài khoản</Btn>}
      </div>
      {adding && <NewUser templates={templates} notify={notify} onCancel={() => setAdding(false)} onDone={() => { setAdding(false); load(); }} />}
      <ul className="space-y-3">
        {users?.map((u) => (<UserRow key={u.id + u.role + u.status + u.templates.join()} user={u} me={me} templates={templates} notify={notify} onChanged={load} />))}
      </ul>
    </div>
  );
}
