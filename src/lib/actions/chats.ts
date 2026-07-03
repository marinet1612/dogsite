'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createSupabaseServerClient,
  requireUser
} from '@/lib/supabase/server';
import { requireConversationMember } from '@/lib/authz';
import { requiredText } from '@/lib/validation';

export async function sendMessageAction(formData: FormData) {
  const conversationId = requiredText(
    formData.get('conversation_id'),
    'Чат',
    100
  );

  const body = requiredText(
    formData.get('body'),
    'Сообщение',
    4000
  );

  const { user, supabase } =
    await requireConversationMember(conversationId);

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body
  });

  if (error) {
    console.error('sendMessageAction:', error);
    throw new Error('Не удалось отправить сообщение');
  }

  revalidatePath(`/chats/${conversationId}`);
}

export async function createDirectConversationAction(
  formData: FormData
) {
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

  const { data: conversationId, error } = await supabase.rpc(
    'create_direct_conversation',
    {
      target_user_id: targetUserId
    }
  );

  if (error || !conversationId) {
    console.error(
      'createDirectConversationAction:',
      error
    );

    throw new Error(
      error?.message || 'Не удалось создать личный чат'
    );
  }

  revalidatePath('/chats');
  redirect(`/chats/${conversationId}`);
}
