'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient, requireUser } from '@/lib/supabase/server';

export async function sendMessageAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const conversationId = String(formData.get('conversation_id'));
  const body = String(formData.get('body') || '').trim();

  if (!body) return;

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/chats/${conversationId}`);
}

export async function createDirectConversationAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const targetUserId = String(formData.get('target_user_id'));

  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert({ type: 'direct', title: 'Личный чат' })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  await supabase.from('conversation_members').insert([
    { conversation_id: conversation.id, user_id: user.id },
    { conversation_id: conversation.id, user_id: targetUserId }
  ]);

  revalidatePath('/chats');
}
