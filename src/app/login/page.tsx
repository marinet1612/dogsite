import Link from 'next/link';
import { signInAction } from '@/lib/actions/auth';

export default function LoginPage() {
  return (
    <main className="container-page flex min-h-[calc(100vh-5rem)] items-center justify-center py-12">
      <form action={signInAction} className="card w-full max-w-lg">
        <div className="badge mb-4">Вход</div>
        <h1 className="text-3xl font-black text-cocoa">Вернуться в Dogram</h1>
        <p className="mt-2 text-sm leading-6 text-cocoa/60">Войдите, чтобы продолжить работу с заявками, прогулками и чатами.</p>
        <div className="mt-6 space-y-4">
          <label><span className="label">Email</span><input className="input" name="email" type="email" required /></label>
          <label><span className="label">Пароль</span><input className="input" name="password" type="password" required /></label>
        </div>
        <button className="btn-primary mt-6 w-full" type="submit">Войти</button>
        <p className="mt-5 text-center text-sm text-cocoa/55">Нет профиля? <Link className="font-bold text-cocoa" href="/register">Зарегистрироваться</Link></p>
      </form>
    </main>
  );
}
