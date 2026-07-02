import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SpecialistCard } from '@/components/specialist-card';
import { MVP_CITY } from '@/lib/config';
import type { SpecialistProfile } from '@/lib/types';

export default async function SpecialistsPage({ searchParams }: { searchParams: Promise<{ problem?: string; district?: string }> }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('specialist_profiles')
    .select('*, specialist_specializations(specialization_type)')
    .eq('verification_status', 'approved')
    .eq('city', MVP_CITY);

  if (params.district) query = query.contains('districts', [params.district]);

  const { data } = await query.order('rating', { ascending: false });

  const specialists = (data || []) as unknown as SpecialistProfile[];
  const filtered = params.problem
    ? specialists.filter((item) => item.specializations?.some((spec) => spec.specialization_type === params.problem))
    : specialists;

  return (
    <main className="container-page py-10">
      <div className="badge mb-4">Санкт-Петербург</div>
      <h1 className="section-title">Каталог кинологов</h1>
      <p className="section-subtitle">Фильтруйте специалистов по проблеме, району и формату работы. В MVP используется простая релевантность по совпадениям.</p>

      <form className="card mt-8 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
        <select className="input" name="problem" defaultValue={params.problem || ''}>
          <option value="">Любая проблема</option>
          <option value="reactivity">Реактивность</option>
          <option value="leash_pulling">Тянет поводок</option>
          <option value="separation_anxiety">Тревога разлуки</option>
          <option value="puppy">Щенок</option>
        </select>
        <input className="input" name="district" placeholder="Район" defaultValue={params.district || ''} />
        <button className="btn-primary" type="submit">Подобрать</button>
      </form>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {filtered.map((specialist) => <SpecialistCard specialist={specialist} key={specialist.id} />)}
      </div>
    </main>
  );
}
