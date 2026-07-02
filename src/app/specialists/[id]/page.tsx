import { notFound } from 'next/navigation';
import { createSupabaseServerClient, getSessionUser } from '@/lib/supabase/server';
import { createOwnerRequestAction } from '@/lib/actions/requests';
import { SoftTag } from '@/components/ui';

export default async function SpecialistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const user = await getSessionUser();

  const [{ data: specialist }, { data: dogs }] = await Promise.all([
    supabase.from('specialist_profiles').select('*, specialist_specializations(specialization_type), specialist_cases(*)').eq('id', id).single(),
    user ? supabase.from('dog_profiles').select('*').eq('owner_id', user.id) : Promise.resolve({ data: [] }) as any
  ]);

  if (!specialist) notFound();

  return (
    <main className="container-page py-10">
      <section className="card bg-gradient-to-br from-white/90 via-white/70 to-paw/15">
        <div className="flex flex-col justify-between gap-8 lg:flex-row">
          <div>
            <div className="badge mb-4">Проверенный профиль</div>
            <h1 className="text-4xl font-black text-cocoa">{specialist.public_name}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-cocoa/65">{specialist.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {specialist.specialist_specializations?.map((spec: any) => <SoftTag tone="orange" key={spec.specialization_type}>{spec.specialization_type}</SoftTag>)}
            </div>
          </div>
          <div className="min-w-72 rounded-[2rem] bg-cocoa p-6 text-white">
            <div className="text-sm text-white/55">Стоимость</div>
            <div className="mt-2 text-3xl font-black">от {specialist.price_from} ₽</div>
            <div className="mt-4 text-sm leading-6 text-white/65">Форматы: {specialist.works_online ? 'онлайн ' : ''}{specialist.works_offline ? 'очно' : ''}</div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <section className="card">
          <h2 className="text-2xl font-black text-cocoa">Кейсы</h2>
          <div className="mt-5 grid gap-4">
            {specialist.specialist_cases?.length ? specialist.specialist_cases.map((caseItem: any) => (
              <div className="rounded-3xl bg-white/70 p-5" key={caseItem.id}>
                <h3 className="font-black text-cocoa">{caseItem.title}</h3>
                <p className="mt-2 text-sm leading-6 text-cocoa/60">{caseItem.result}</p>
              </div>
            )) : <p className="text-sm text-cocoa/60">Кейсы будут добавлены позже.</p>}
          </div>
        </section>

        <section id="request" className="card">
          <h2 className="text-2xl font-black text-cocoa">Отправить заявку</h2>
          {!user ? <p className="mt-4 text-sm text-cocoa/60">Для отправки заявки нужно войти.</p> : (
            <form action={createOwnerRequestAction} className="mt-5 grid gap-4">
              <input type="hidden" name="specialist_id" value={specialist.id} />
              <select className="input" name="dog_id" required>{dogs?.map((dog: any) => <option value={dog.id} key={dog.id}>{dog.name}</option>)}</select>
              <select className="input" name="problem_type"><option value="reactivity">Реактивность</option><option value="leash_pulling">Тянет поводок</option><option value="separation_anxiety">Тревога разлуки</option></select>
              <select className="input" name="preferred_format"><option value="offline">Очно</option><option value="online">Онлайн</option></select>
              <input className="input" name="district" placeholder="Район" />
              <input className="input" name="budget" type="number" placeholder="Бюджет" />
              <textarea className="input min-h-28" name="description" placeholder="Опишите ситуацию. Это сообщение сразу попадёт в чат с кинологом." />
              <button className="btn-primary" type="submit">Создать заявку и чат</button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
