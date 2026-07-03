import { createSupabaseServerClient, requireUser } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types';

export async function requireRole(roles: UserRole[]) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !roles.includes(profile.role as UserRole)) {
    throw new Error('Недостаточно прав');
  }

  return { user, supabase };
}

export async function requireDogOwner(dogId: string) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: dog } = await supabase
    .from('dog_profiles')
    .select('id')
    .eq('id', dogId)
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!dog) {
    throw new Error('Собака не найдена или принадлежит другому пользователю');
  }

  return { user, supabase };
}

export async function requireConversationMember(conversationId: string) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: membership } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) throw new Error('Нет доступа к этому чату');

  return { user, supabase };
}

export async function requireAssignedSpecialist(requestId: string) {
  const { user, supabase } = await requireRole(['specialist']);

  const { data: specialist } = await supabase
    .from('specialist_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!specialist) throw new Error('Профиль специалиста не найден');

  const { data: request } = await supabase
    .from('owner_requests')
    .select('id')
    .eq('id', requestId)
    .eq('specialist_id', specialist.id)
    .maybeSingle();

  if (!request) throw new Error('Заявка назначена другому специалисту');

  return { user, supabase };
}
