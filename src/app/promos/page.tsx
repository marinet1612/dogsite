import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SoftTag } from '@/components/ui';

export default async function PromosPage() {
  const supabase = await createSupabaseServerClient();
  const { data: promos } = await supabase.from('promo_codes').select('*, brands(name, logo_url)').eq('is_active', true).order('created_at', { ascending: false });

  return (
    <main className="container-page py-10">
      <div className="badge mb-4">Партнёры</div>
      <h1 className="section-title">Промокоды и полезные подборки</h1>
      <p className="section-subtitle">Пока без кабинета бренда. Промокоды добавляются через админку и позволяют проверить коммерческий интерес.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {promos?.map((promo: any) => (
          <article className="card" key={promo.id}>
            <SoftTag tone="green">{promo.target_segment}</SoftTag>
            <h2 className="mt-4 text-xl font-black text-cocoa">{promo.title}</h2>
            <p className="mt-3 text-sm leading-6 text-cocoa/60">{promo.description}</p>
            <div className="mt-5 rounded-2xl border border-dashed border-cocoa/20 bg-white/70 p-4 text-center font-black tracking-widest text-cocoa">{promo.code}</div>
          </article>
        ))}
      </div>
    </main>
  );
}
