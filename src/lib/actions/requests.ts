'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { MVP_CITY } from '@/lib/config';
import {
  requireAssignedSpecialist,
  requireDogOwner
} from '@/lib/authz';
import {
  numberInRange,
  oneOf,
  optionalText,
  requiredText
} from '@/lib/validation';

const PROBLEM_TYPES = [
  'reactivity',
  'leash_pulling',
  'separation_anxiety',
  'puppy',
  'other'
] as const;

const REQUEST_FORMATS = ['offline', 'online'] as const;
const SPECIALIST_STATUSES = ['accepted', 'rejected'] as const;

export async function createOwnerRequestAction(
  formData: FormData
) {
  const dogId = requiredText(
    formData.get('dog_id'),
    'Собака',
    100
  );

  const { user, supabase } = await requireDogOwner(dogId);

  const specialistId = requiredText(
    formData.get('specialist_id'),
    'Специалист',
    100
  );

  const { data: specialist, error: specialistError } =
    await supabase
      .from('specialist_profiles')
      .select('id, user_id')
      .eq('id', specialistId)
      .eq('verification_status', 'approved')
      .maybeSingle();

  if (
    specialistError ||
    !specialist ||
    !specialist.user_id
  ) {
    throw new Error(
      'Специалист не найден или ещё не подтверждён'
    );
  }

  const description = optionalText(
    formData.get('description'),
    3000
  );

  const { data: request, error: requestError } =
    await supabase
      .from('owner_requests')
      .insert({
        owner_id: user.id,
        dog_id: dogId,
        specialist_id: specialistId,

        problem_type: oneOf(
          formData.get('problem_type') || 'reactivity',
          PROBLEM_TYPES,
          'Проблема'
        ),

        description,

        preferred_format: oneOf(
          formData.get('preferred_format') || 'offline',
          REQUEST_FORMATS,
          'Формат'
        ),

        city: MVP_CITY,
        district: optionalText(formData.get('district'), 120),

        budget: numberInRange(
          formData.get('budget') || 0,
          'Бюджет',
          0,
          1_000_000
        ),

        status: 'sent'
      })
      .select('id')
      .single();

  if (requestError || !request) {
    console.error('createOwnerRequestAction request:', requestError);
    throw new Error('Не удалось создать заявку');
  }

  const { data: conversation, error: conversationError } =
    await supabase
      .from('conversations')
      .insert({
        type: 'request',
        title: 'Заявка к кинологу',
        owner_request_id: request.id
      })
      .select('id')
      .single();

  if (conversationError || !conversation) {
    console.error(
      'createOwnerRequestAction conversation:',
      conversationError
    );

    await supabase
      .from('owner_requests')
      .delete()
      .eq('id', request.id)
      .eq('owner_id', user.id);

    throw new Error('Не удалось создать чат заявки');
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
        user_id: specialist.user_id
      }
    ]);

  if (membersError) {
    console.error(
      'createOwnerRequestAction members:',
      membersError
    );

    throw new Error('Не удалось добавить участников чата');
  }

  const firstMessage =
    description ||
    'Здравствуйте. Хочу обсудить занятие по заявке.';

  const { error: messageError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      body: firstMessage
    });

  if (messageError) {
    console.error(
      'createOwnerRequestAction message:',
      messageError
    );
  }

  revalidatePath('/owner/requests');
  redirect(`/chats/${conversation.id}`);
}

export async function updateRequestStatusAction(
  formData: FormData
) {
  const requestId = requiredText(
    formData.get('request_id'),
    'Заявка',
    100
  );

  const status = oneOf(
    formData.get('status'),
    SPECIALIST_STATUSES,
    'Статус'
  );

  const { supabase } =
    await requireAssignedSpecialist(requestId);

  const { error } = await supabase
    .from('owner_requests')
    .update({ status })
    .eq('id', requestId);

  if (error) {
    console.error('updateRequestStatusAction:', error);
    throw new Error('Не удалось изменить статус заявки');
  }

  revalidatePath('/specialist/requests');
  revalidatePath('/specialist');
  revalidatePath('/owner/requests');
}
