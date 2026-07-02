import { createSupabaseServerClient, requireUser } from '@/lib/supabase/server';
import { upsertSpecialistProfileAction } from '@/lib/actions/specialists';
import { updateRequestStatusAction } from '@/lib/actions/requests';
import { SoftTag } from '@/components/ui';

export default async function SpecialistDashboardPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase.from('specialist_profiles').select('*').eq('user_id', user.id).maybeSingle();
  const { data: requests } = profile
    ? await supabase.from('owner_requests').select('*, dog_profiles(name, breed), profiles!owner_requests_owner_id_fkey(full_name)').eq('specialist_id', profile.id).order('created_at', { ascending: false })
    : { data: [] } as any;

  return (
    <main className="container-page py-10">
      <div className="badge mb-4">Кабинет кинолога</div>
      <h1 className="section-title">Профиль и входящие заявки</h1>
      <p className="section-subtitle">После заполнения профиль попадает на проверку администратору. После подтверждения он отображается в каталоге.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1fr]">
        <section className="card">
          <h2 className="text-2xl font-black text-cocoa">Профиль специалиста</h2>
          {profile ? <div className="mt-3"><SoftTag tone={profile.verification_status === 'approved' ? 'green' : 'orange'}>{profile.verification_status}</SoftTag></div> : null}
          <form action={upsertSpecialistProfileAction} className="mt-5 grid gap-4">
            <input className="input" name="public_name" placeholder="Публичное имя" defaultValue={profile?.public_name || ''} required />
            <input className="input" name="districts" placeholder="Районы через запятую" defaultValue={profile?.districts?.join(', ') || ''} />
            <input className="input" name="specializations" placeholder="reactivity, leash_pulling, puppy" />
            <input className="input" name="experience_years" type="number" placeholder="Опыт, лет" defaultValue={profile?.experience_years || ''} />
            <input className="input" name="education" placeholder="Образование" defaultValue={profile?.education || ''} />
            <textarea className="input min-h-24" name="description" placeholder="Описание подхода" defaultValue={profile?.description || ''} />
            <input className="input" name="methods" placeholder="Методы работы" defaultValue={profile?.methods || ''} />
            <div className="grid gap-4 sm:grid-cols-2"><input className="input" name="price_from" type="number" placeholder="Цена от" defaultValue={profile?.price_from || ''} /><input className="input" name="price_to" type="number" placeholder="Цена до" defaultValue={profile?.price_to || ''} /></div>
            <label className="flex items-center gap-2 text-sm font-semibold"><input name="works_online" type="checkbox" defaultChecked={profile?.works_online} /> Онлайн</label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input name="works_offline" type="checkbox" defaultChecked={profile?.works_offline ?? true} /> Очно</label>
            <button className="btn-primary" type="submit">Сохранить и отправить на проверку</button>
          </form>
        </section>

        <section className="card">
          <h2 className="text-2xl font-black text-cocoa">Заявки</h2>
          <div className="mt-5 space-y-4">
            {requests?.map((request: any) => (
              <div className="rounded-3xl bg-white/70 p-5" key={request.id}>
                <div className="flex items-start justify-between gap-4"><div><b>{request.problem_type}</b><p className="mt-1 text-sm text-cocoa/55">{request.dog_profiles?.name} · {request.dog_profiles?.breed}</p></div><SoftTag tone="blue">{request.status}</SoftTag></div>
                <p className="mt-3 text-sm leading-6 text-cocoa/60">{request.description}</p>
                <div className="mt-4 flex gap-2">
                  <form action={updateRequestStatusAction}><input type="hidden" name="request_id" value={request.id} /><input type="hidden" name="status" value="accepted" /><button className="btn-primary" type="submit">Принять</button></form>
                  <form action={updateRequestStatusAction}><input type="hidden" name="request_id" value={request.id} /><input type="hidden" name="status" value="rejected" /><button className="btn-secondary" type="submit">Отклонить</button></form>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
