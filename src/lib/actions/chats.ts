'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient, requireUser } from '@/lib/supabase/server';
import { requireConversationMember } from '@/lib/authz';
import { requiredText } from '@/lib/validation';

export async function sendMessageAction(formData: FormData) {
  const conversationId = requiredText(
    formData.get('conversation_id'),
    'Чат',
    100
  );

  const body = requiredText(formData.get('body'), 'Сообщение', 4000);
  const { user, supabase } =
    await requireConversationMember(conversationId);

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body
  });

  if (error) throw new Error('Не удалось отправить сообщение');

  revalidatePath(`/chats/${conversationId}`);
}

export async function createDirectConversationAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const targetUserId = requiredText(
    formData.get('target_user_id'),
    'Получатель',
    100
  );

  if (targetUserId === user.id) {
    throw new Error('Нельзя создать чат с самим собой');
  }

  const { data: target } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', targetUserId)
    .maybeSingle();

  if (!target) throw new Error('Пользователь не найден');

  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert({
      type: 'direct',
      title: 'Личный чат'
    })
    .select('id')
    .single();

  if (error || !conversation) {
    throw new Error('Не удалось создать чат');
  }

  const { error: membersError } = await supabase
    .from('conversation_members')
    .insert([
      {
        conversation_id: conversation.id,
        user_id: user.id
      },
      {
        conversation_id: conversation.id,
        user_id: targetUserId
      }
    ]);

  if (membersError) {
    throw new Error('Не удалось добавить участников');
  }

  revalidatePath('/chats');
}
