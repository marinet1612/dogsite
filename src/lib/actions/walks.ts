'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient, requireUser } from '@/lib/supabase/server';
import { MVP_CITY } from '@/lib/config';

export async function createWalkAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: walk, error } = await supabase
    .from('walks')
    .insert({
      creator_id: user.id,
      dog_id: String(formData.get('dog_id')),
      city: MVP_CITY,
      district: String(formData.get('district') || '').trim(),
      meeting_place: String(formData.get('meeting_place') || '').trim(),
      walk_datetime: String(formData.get('walk_datetime')),
      walk_type: String(formData.get('walk_type') || 'calm'),
      description: String(formData.get('description') || '').trim(),
      allowed_dog_size: String(formData.get('allowed_dog_size') || 'any'),
      allowed_activity_level: String(formData.get('allowed_activity_level') || 'any'),
      contact_allowed: formData.get('contact_allowed') === 'on',
      status: 'active'
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { data: conversation } = await supabase
    .from('conversations')
    .insert({
      type: 'walk',
      title: 'Чат прогулки',
      walk_id: walk.id
    })
    .select('id')
    .single();

  if (conversation) {
    await supabase
      .from('conversation_members')
      .insert({
        conversation_id: conversation.id,
        user_id: user.id
      });
  }

  revalidatePath('/walks');
}

export async function requestWalkParticipationAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const walkId = String(formData.get('walk_id'));
  const dogId = String(formData.get('dog_id'));

  if (!walkId || !dogId) {
    throw new Error('Не выбрана прогулка или собака');
  }

  const { data: walk, error: walkError } = await supabase
    .from('walks')
    .select('id, creator_id')
    .eq('id', walkId)
    .single();

  if (walkError) {
    throw new Error(walkError.message);
  }

  if (walk.creator_id === user.id) {
    revalidatePath('/walks');
    return;
  }

  const { data: dog, error: dogError } = await supabase
    .from('dog_profiles')
    .select('id')
    .eq('id', dogId)
    .eq('owner_id', user.id)
    .single();

  if (dogError || !dog) {
    throw new Error('Можно отправить заявку только от имени своей собаки');
  }

  const { data: existingParticipant, error: existingError } = await supabase
    .from('walk_participants')
    .select('id')
    .eq('walk_id', walkId)
    .eq('user_id', user.id)
    .eq('dog_id', dogId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingParticipant) {
    revalidatePath('/walks');
    return;
  }

  const { error } = await supabase
    .from('walk_participants')
    .insert({
      walk_id: walkId,
      user_id: user.id,
      dog_id: dogId,
      status: 'requested'
    });

  if (error && error.code !== '23505') {
    throw new Error(error.message);
  }

  revalidatePath('/walks');
}
