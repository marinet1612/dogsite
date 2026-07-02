import { createSupabaseServerClient, getSessionUser } from '@/lib/supabase/server';
import { createWalkAction, requestWalkParticipationAction } from '@/lib/actions/walks';
import { SoftTag } from '@/components/ui';

export default async function WalksPage() {
  const supabase = await createSupabaseServerClient();
  const user = await getSessionUser();

  const [{ data: walks }, { data: dogs }] = await Promise.all([
    supabase.from('walks').select('*, dog_profiles(name, breed), profiles(full_name)').order('walk_datetime', { ascending: true }),
    user ? supabase.from('dog_profiles').select('*').eq('owner_id', user.id) : Promise.resolve({ data: [] }) as any
  ]);

  return (
    <main className="container-page py-10">
      <div className="badge mb-4">Прогулки</div>
      <h1 className="section-title">Найти спокойную компанию рядом</h1>
      <p className="section-subtitle">В MVP прогулки работают как список встреч. Позже можно добавить карту и геолокацию.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1fr]">
        <section className="card">
          <h2 className="text-2xl font-black text-cocoa">Создать прогулку</h2>
          {user ? <form action={createWalkAction} className="mt-5 grid gap-4">
            <select className="input" name="dog_id" required>{dogs?.map((dog: any) => <option value={dog.id} key={dog.id}>{dog.name}</option>)}</select>
            <input className="input" name="district" placeholder="Район" />
            <input className="input" name="meeting_place" placeholder="Место встречи" />
            <input className="input" name="walk_datetime" type="datetime-local" />
            <select className="input" name="walk_type"><option value="calm">Спокойная</option><option value="parallel">Параллельная без контакта</option><option value="puppy">Для щенков</option><option value="training">Совместная тренировка</option></select>
            <textarea className="input min-h-24" name="description" placeholder="Описание условий" />
            <label className="flex items-center gap-2 text-sm font-semibold"><input name="contact_allowed" type="checkbox" /> Контакт между собаками разрешён</label>
            <button className="btn-primary" type="submit">Создать</button>
          </form> : <p className="mt-4 text-sm text-cocoa/60">Войдите, чтобы создать прогулку.</p>}
        </section>

        <section className="grid gap-4">
          {walks?.map((walk: any) => (
            <article className="card" key={walk.id}>
              <div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-black text-cocoa">{walk.district} · {walk.meeting_place}</h3><p className="mt-1 text-sm text-cocoa/55">{new Date(walk.walk_datetime).toLocaleString('ru-RU')}</p></div><SoftTag tone="green">{walk.walk_type}</SoftTag></div>
              <p className="mt-3 text-sm leading-6 text-cocoa/60">{walk.description}</p>
              {user ? <form action={requestWalkParticipationAction} className="mt-4 flex gap-3"><input type="hidden" name="walk_id" value={walk.id} /><select className="input max-w-48" name="dog_id">{dogs?.map((dog: any) => <option value={dog.id} key={dog.id}>{dog.name}</option>)}</select><button className="btn-primary" type="submit">Запросить участие</button></form> : null}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
