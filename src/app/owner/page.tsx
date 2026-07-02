import Link from 'next/link';
import { createSupabaseServerClient, requireUser } from '@/lib/supabase/server';
import { createDogAction, createProgressEntryAction } from '@/lib/actions/dogs';
import { EmptyState, SoftTag } from '@/components/ui';

export default async function OwnerDashboardPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const [{ data: dogs }, { data: requests }, { data: progress }] = await Promise.all([
    supabase.from('dog_profiles').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
    supabase.from('owner_requests').select('*, specialist_profiles(public_name)').eq('owner_id', user.id).order('created_at', { ascending: false }),
    supabase.from('progress_entries').select('*, dog_profiles(name)').eq('owner_id', user.id).order('entry_date', { ascending: false }).limit(5)
  ]);

  return (
    <main className="container-page py-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="badge mb-4">Кабинет владельца</div>
          <h1 className="section-title">Питомцы, заявки и прогресс</h1>
          <p className="section-subtitle">Сначала добавьте карточку собаки. После этого можно отправлять заявки кинологам и вести дневник.</p>
        </div>
        <Link href="/specialists" className="btn-primary">Найти кинолога</Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="card">
          <h2 className="text-2xl font-black text-cocoa">Мои собаки</h2>
          <div className="mt-5 grid gap-4">
            {dogs?.length ? dogs.map((dog) => (
              <div className="rounded-3xl bg-white/70 p-5" key={dog.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-cocoa">{dog.name}</h3>
                    <p className="mt-1 text-sm text-cocoa/55">{dog.breed || 'Порода не указана'} · {dog.district || 'район не указан'}</p>
                  </div>
                  <SoftTag tone="green">{dog.activity_level || 'medium'}</SoftTag>
                </div>
                <p className="mt-3 text-sm leading-6 text-cocoa/60">{dog.description}</p>
              </div>
            )) : <EmptyState title="Пока нет карточек" text="Создайте карточку собаки, чтобы пользоваться подбором кинолога и дневником." />}
          </div>
        </section>

        <section className="card">
          <h2 className="text-2xl font-black text-cocoa">Добавить собаку</h2>
          <form action={createDogAction} className="mt-5 grid gap-4">
            <input className="input" name="name" placeholder="Имя собаки" required />
            <input className="input" name="breed" placeholder="Порода" />
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="input" name="age_months" placeholder="Возраст, мес." type="number" />
              <input className="input" name="weight" placeholder="Вес, кг" type="number" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <select className="input" name="sex"><option value="female">Девочка</option><option value="male">Мальчик</option><option value="unknown">Не указано</option></select>
              <select className="input" name="size"><option value="small">Маленькая</option><option value="medium">Средняя</option><option value="large">Крупная</option></select>
            </div>
            <input className="input" name="district" placeholder="Район Санкт-Петербурга" />
            <textarea className="input min-h-28" name="description" placeholder="Особенности поведения, триггеры, задачи" />
            <button className="btn-primary" type="submit">Сохранить карточку</button>
          </form>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="text-2xl font-black text-cocoa">Последние заявки</h2>
          <div className="mt-5 space-y-3">
            {requests?.length ? requests.slice(0, 4).map((request) => (
              <div className="rounded-3xl bg-white/70 p-4" key={request.id}>
                <div className="flex justify-between gap-3"><b>{request.problem_type}</b><SoftTag tone="blue">{request.status}</SoftTag></div>
                <p className="mt-1 text-sm text-cocoa/55">Кинолог: {request.specialist_profiles?.public_name}</p>
              </div>
            )) : <EmptyState title="Заявок пока нет" text="Откройте каталог кинологов и отправьте первую заявку." />}
          </div>
        </section>

        <section className="card">
          <h2 className="text-2xl font-black text-cocoa">Добавить запись прогресса</h2>
          <form action={createProgressEntryAction} className="mt-5 grid gap-4">
            <select className="input" name="dog_id" required>{dogs?.map((dog) => <option value={dog.id} key={dog.id}>{dog.name}</option>)}</select>
            <input className="input" name="title" placeholder="Например: спокойная параллельная прогулка" />
            <div className="grid gap-4 sm:grid-cols-2">
              <select className="input" name="problem_type"><option value="reactivity">Реактивность</option><option value="leash_pulling">Тянет поводок</option><option value="separation_anxiety">Тревога разлуки</option></select>
              <input className="input" name="entry_date" type="date" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <input className="input" name="reaction_level" placeholder="Реакция 1-5" type="number" min="1" max="5" />
              <input className="input" name="condition_score" placeholder="Состояние 1-5" type="number" min="1" max="5" />
              <input className="input" name="trigger_distance" placeholder="Дистанция, м" type="number" />
            </div>
            <textarea className="input min-h-24" name="description" placeholder="Что произошло, что помогло, что повторить" />
            <button className="btn-primary" type="submit">Добавить запись</button>
          </form>
          <div className="mt-5 space-y-2">
            {progress?.map((entry) => <div className="rounded-2xl bg-white/70 p-3 text-sm" key={entry.id}>{entry.entry_date}: {entry.title || entry.problem_type}</div>)}
          </div>
        </section>
      </div>
    </main>
  );
}
