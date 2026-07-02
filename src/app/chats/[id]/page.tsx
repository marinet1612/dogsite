import { notFound } from 'next/navigation';
import { createSupabaseServerClient, requireUser } from '@/lib/supabase/server';
import { ChatClient } from '@/components/chat-client';
import type { Message, Profile } from '@/lib/types';

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: membership } = await supabase.from('conversation_members').select('*').eq('conversation_id', id).eq('user_id', user.id).maybeSingle();
  if (!membership) notFound();

  const [{ data: messages }, { data: members }] = await Promise.all([
    supabase.from('messages').select('*').eq('conversation_id', id).order('created_at', { ascending: true }),
    supabase.from('conversation_members').select('profiles(*)').eq('conversation_id', id)
  ]);

  const profiles = (members || []).map((item: any) => item.profiles).filter(Boolean) as Profile[];

  return (
    <main className="container-page py-10">
      <ChatClient conversationId={id} currentUserId={user.id} initialMessages={(messages || []) as Message[]} profiles={profiles} />
    </main>
  );
}
