import { createSupabaseServerClient, requireUser } from '@/lib/supabase/server';
import { approveSpecialistAction, rejectSpecialistAction } from '@/lib/actions/specialists';
import { SoftTag } from '@/components/ui';

export default async function AdminPage() {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const [{ data: specialists }, { data: users }, { data: requests }] = await Promise.all([
    supabase.from('specialist_profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('owner_requests').select('*').order('created_at', { ascending: false }).limit(20)
  ]);

  return (
    <main className="container-page py-10">
      <div className="badge mb-4">Админ-панель</div>
      <h1 className="section-title">Модерация MVP</h1>
      <p className="section-subtitle">Первая версия админки: пользователи, кинологи на проверке и заявки.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card">
          <h2 className="text-2xl font-black text-cocoa">Кинологи</h2>
          <div className="mt-5 space-y-4">
            {specialists?.map((specialist) => (
              <div className="rounded-3xl bg-white/70 p-5" key={specialist.id}>
                <div className="flex items-start justify-between gap-4"><div><b>{specialist.public_name}</b><p className="mt-1 text-sm text-cocoa/55">{specialist.city}</p></div><SoftTag tone="orange">{specialist.verification_status}</SoftTag></div>
                <div className="mt-4 flex gap-2">
                  <form action={approveSpecialistAction}><input type="hidden" name="specialist_id" value={specialist.id} /><button className="btn-primary" type="submit">Подтвердить</button></form>
                  <form action={rejectSpecialistAction}><input type="hidden" name="specialist_id" value={specialist.id} /><button className="btn-secondary" type="submit">Отклонить</button></form>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="card">
            <h2 className="text-2xl font-black text-cocoa">Пользователи</h2>
            <div className="mt-5 space-y-2">{users?.map((user) => <div className="rounded-2xl bg-white/70 p-3 text-sm" key={user.id}>{user.full_name || user.email} · {user.role}</div>)}</div>
          </div>
          <div className="card">
            <h2 className="text-2xl font-black text-cocoa">Заявки</h2>
            <div className="mt-5 space-y-2">{requests?.map((request) => <div className="rounded-2xl bg-white/70 p-3 text-sm" key={request.id}>{request.problem_type} · {request.status}</div>)}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
