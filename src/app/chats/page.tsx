import Link from 'next/link';
import { createSupabaseServerClient, requireUser } from '@/lib/supabase/server';
import { EmptyState, SoftTag } from '@/components/ui';

export default async function ChatsPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: memberships } = await supabase
    .from('conversation_members')
    .select('conversation_id, conversations(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="container-page py-10">
      <div className="badge mb-4">Чаты</div>
      <h1 className="section-title">История рекомендаций и договорённостей</h1>
      <p className="section-subtitle">Здесь хранятся чаты по заявкам, прогулкам и личным диалогам.</p>
      <section className="card mt-8">
        <div className="grid gap-4">
          {memberships?.length ? memberships.map((item: any) => (
            <Link href={`/chats/${item.conversation_id}`} className="rounded-3xl bg-white/70 p-5 transition hover:-translate-y-0.5 hover:bg-white" key={item.conversation_id}>
              <div className="flex items-center justify-between gap-4"><h3 className="font-black text-cocoa">{item.conversations?.title || 'Диалог'}</h3><SoftTag tone="purple">{item.conversations?.type}</SoftTag></div>
              <p className="mt-1 text-sm text-cocoa/55">Открыть историю сообщений</p>
            </Link>
          )) : <EmptyState title="Чатов пока нет" text="Чат появится после отправки заявки кинологу или создания прогулки." />}
        </div>
      </section>
    </main>
  );
}
