import Link from 'next/link';
import { CalendarCheck, HeartHandshake, MessageCircle, PawPrint, Search, Sparkles } from 'lucide-react';
import { BRAND_NAME, MVP_CITY } from '@/lib/config';
import { StatCard } from '@/components/ui';

export default function HomePage() {
  return (
    <main>
      <section className="container-page grid min-h-[calc(100vh-5rem)] items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="badge mb-5"><Sparkles size={14} className="mr-2" /> MVP для Санкт-Петербурга</div>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-cocoa sm:text-6xl lg:text-7xl">
            Все задачи с собакой — в одном мягком и понятном сервисе
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cocoa/65">
            {BRAND_NAME} помогает владельцу найти кинолога под конкретную проблему, вести дневник прогресса, договариваться о прогулках и сохранять рекомендации в чате.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="btn-primary">Создать профиль собаки</Link>
            <Link href="/specialists" className="btn-secondary">Посмотреть кинологов</Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <StatCard label="Кинологи" value="12" hint="Стартовая база специалистов" />
            <StatCard label="Районы" value="18" hint={`Фокус: ${MVP_CITY}`} />
            <StatCard label="Чаты" value="3 типа" hint="Заявки, прогулки, личные" />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-8 -top-8 h-36 w-36 rounded-full bg-paw/30 blur-3xl" />
          <div className="absolute -bottom-8 -right-8 h-44 w-44 rounded-full bg-mint/40 blur-3xl" />
          <div className="card relative overflow-hidden p-5">
            <div className="rounded-[1.6rem] bg-gradient-to-br from-paw/25 via-white to-mint/25 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-cocoa/55">Карточка питомца</div>
                  <h2 className="mt-1 text-3xl font-black text-cocoa">Луна, БШО</h2>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-cocoa shadow-soft"><PawPrint size={30} /></div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/80 p-4"><Search className="mb-3 text-orange-700" /><b>Подбор</b><p className="mt-1 text-sm text-cocoa/55">Реактивность, поводок, тревога</p></div>
                <div className="rounded-3xl bg-white/80 p-4"><MessageCircle className="mb-3 text-purple-700" /><b>Чат</b><p className="mt-1 text-sm text-cocoa/55">Все рекомендации в истории</p></div>
                <div className="rounded-3xl bg-white/80 p-4"><CalendarCheck className="mb-3 text-emerald-700" /><b>Прогресс</b><p className="mt-1 text-sm text-cocoa/55">Динамика по дням</p></div>
                <div className="rounded-3xl bg-white/80 p-4"><HeartHandshake className="mb-3 text-sky-700" /><b>Прогулки</b><p className="mt-1 text-sm text-cocoa/55">Параллельно и спокойно</p></div>
              </div>
              <div className="mt-6 rounded-3xl bg-cocoa p-5 text-white">
                <div className="text-sm text-white/60">Рекомендация кинолога</div>
                <p className="mt-2 text-sm leading-6">Сегодня работаем на дистанции 20–25 м, фиксируем реакции 1–5 и не сокращаем дистанцию после срыва.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="section-title">Что входит в первую рабочую версию</h2>
        <p className="section-subtitle">Сначала строим не «ещё одну соцсеть», а сервис с понятными сценариями: проблема → специалист → чат → прогресс.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ['Подбор кинолога', 'Анкета проблемы, релевантность, профиль специалиста и заявка.'],
            ['Дневник прогресса', 'Записи занятий, уровень реакции, дистанция, комментарии и история.'],
            ['Чаты', 'Диалоги по заявкам, прогулкам и личным контактам между собачниками.']
          ].map(([title, text]) => (
            <div className="card" key={title}>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-paw/15 text-orange-800"><PawPrint /></div>
              <h3 className="text-xl font-black text-cocoa">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-cocoa/60">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
