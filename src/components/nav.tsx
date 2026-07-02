import Link from 'next/link';
import { PawPrint, MessageCircle, UserRound, ShieldCheck } from 'lucide-react';
import { BRAND_NAME, routes } from '@/lib/config';
import { signOutAction } from '@/lib/actions/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function Nav() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    : { data: null };

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-cream/75 backdrop-blur-xl">
      <div className="container-page flex h-20 items-center justify-between gap-6">
        <Link href={routes.home} className="flex items-center gap-3 font-black text-cocoa">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cocoa text-white shadow-lg shadow-cocoa/20">
            <PawPrint size={22} />
          </span>
          <span className="text-xl">{BRAND_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-2 text-sm font-semibold text-cocoa/70 md:flex">
          <Link className="rounded-xl px-3 py-2 hover:bg-white/70" href={routes.specialists}>Кинологи</Link>
          <Link className="rounded-xl px-3 py-2 hover:bg-white/70" href={routes.walks}>Прогулки</Link>
          <Link className="rounded-xl px-3 py-2 hover:bg-white/70" href={routes.knowledge}>База знаний</Link>
          <Link className="rounded-xl px-3 py-2 hover:bg-white/70" href={routes.promos}>Промокоды</Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link className="btn-secondary hidden sm:inline-flex" href={routes.chats}>
                <MessageCircle className="mr-2" size={17} /> Чаты
              </Link>
              <Link className="btn-secondary hidden sm:inline-flex" href={routes.owner}>
                <UserRound className="mr-2" size={17} /> Кабинет
              </Link>
              {profile?.role === 'admin' ? (
                <Link className="btn-secondary hidden lg:inline-flex" href={routes.admin}>
                  <ShieldCheck className="mr-2" size={17} /> Админ
                </Link>
              ) : null}
              <form action={signOutAction}>
                <button className="btn-primary" type="submit">Выйти</button>
              </form>
            </>
          ) : (
            <>
              <Link className="btn-secondary" href={routes.login}>Войти</Link>
              <Link className="btn-primary" href={routes.register}>Создать профиль</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
