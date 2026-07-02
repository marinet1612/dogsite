'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, requireUser } from '@/lib/supabase/server';
import { MVP_CITY } from '@/lib/config';

export async function createOwnerRequestAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const specialistId = String(formData.get('specialist_id'));
  const dogId = String(formData.get('dog_id'));

  const { data: request, error } = await supabase
    .from('owner_requests')
    .insert({
      owner_id: user.id,
      dog_id: dogId,
      specialist_id: specialistId,
      problem_type: String(formData.get('problem_type') || 'reactivity'),
      description: String(formData.get('description') || '').trim(),
      preferred_format: String(formData.get('preferred_format') || 'offline'),
      city: MVP_CITY,
      district: String(formData.get('district') || '').trim(),
      budget: Number(formData.get('budget') || 0),
      status: 'sent'
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  const { data: conversation, error: chatError } = await supabase
    .from('conversations')
    .insert({
      type: 'request',
      title: 'Заявка к кинологу',
      owner_request_id: request.id
    })
    .select('id')
    .single();

  if (chatError) throw new Error(chatError.message);

  const { data: specialist } = await supabase
    .from('specialist_profiles')
    .select('user_id')
    .eq('id', specialistId)
    .single();

  await supabase.from('conversation_members').insert([
    { conversation_id: conversation.id, user_id: user.id },
    { conversation_id: conversation.id, user_id: specialist?.user_id }
  ]);

  await supabase.from('messages').insert({
    conversation_id: conversation.id,
    sender_id: user.id,
    body: String(formData.get('description') || 'Здравствуйте. Хочу обсудить занятие по заявке.').trim()
  });

  revalidatePath('/owner/requests');
  redirect(`/chats/${conversation.id}`);
}

export async function updateRequestStatusAction(formData: FormData) {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const requestId = String(formData.get('request_id'));
  const status = String(formData.get('status'));

  const { error } = await supabase
    .from('owner_requests')
    .update({ status })
    .eq('id', requestId);

  if (error) throw new Error(error.message);
  revalidatePath('/specialist/requests');
  revalidatePath('/owner/requests');
}
