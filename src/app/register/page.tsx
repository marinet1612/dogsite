import Link from 'next/link';
import { signUpAction } from '@/lib/actions/auth';

export default function RegisterPage() {
  return (
    <main className="container-page flex min-h-[calc(100vh-5rem)] items-center justify-center py-12">
      <form action={signUpAction} className="card w-full max-w-xl">
        <div className="badge mb-4">Регистрация</div>
        <h1 className="text-3xl font-black text-cocoa">Создать профиль</h1>
        <p className="mt-2 text-sm leading-6 text-cocoa/60">Для публичной регистрации доступны владелец и кинолог. Администратор назначается вручную в базе.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="label">Имя</span><input className="input" name="full_name" required placeholder="Марина" /></label>
          <label><span className="label">Email</span><input className="input" name="email" type="email" required /></label>
          <label><span className="label">Пароль</span><input className="input" name="password" type="password" minLength={6} required /></label>
          <label className="sm:col-span-2"><span className="label">Роль</span><select className="input" name="role" defaultValue="owner"><option value="owner">Владелец собаки</option><option value="specialist">Кинолог</option></select></label>
        </div>
        <button className="btn-primary mt-6 w-full" type="submit">Создать профиль</button>
        <p className="mt-5 text-center text-sm text-cocoa/55">Уже есть профиль? <Link className="font-bold text-cocoa" href="/login">Войти</Link></p>
      </form>
    </main>
  );
}
