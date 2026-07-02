'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, requireUser } from '@/lib/supabase/server';
import { MVP_CITY } from '@/lib/config';

export async function upsertSpecialistProfileAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const districts = String(formData.get('districts') || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const specializations = String(formData.get('specializations') || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const { data: profile, error } = await supabase
    .from('specialist_profiles')
    .upsert({
      user_id: user.id,
      public_name: String(formData.get('public_name') || '').trim(),
      city: MVP_CITY,
      districts,
      experience_years: Number(formData.get('experience_years') || 0),
      education: String(formData.get('education') || '').trim(),
      description: String(formData.get('description') || '').trim(),
      methods: String(formData.get('methods') || '').trim(),
      price_from: Number(formData.get('price_from') || 0),
      price_to: Number(formData.get('price_to') || 0),
      works_online: formData.get('works_online') === 'on',
      works_offline: formData.get('works_offline') === 'on',
      verification_status: 'pending'
    }, { onConflict: 'user_id' })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  if (profile?.id) {
    await supabase.from('specialist_specializations').delete().eq('specialist_id', profile.id);
    if (specializations.length > 0) {
      await supabase.from('specialist_specializations').insert(
        specializations.map((specialization_type) => ({
          specialist_id: profile.id,
          specialization_type
        }))
      );
    }
  }

  revalidatePath('/specialist');
  redirect('/specialist');
}

export async function approveSpecialistAction(formData: FormData) {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const specialistId = String(formData.get('specialist_id'));

  const { error } = await supabase
    .from('specialist_profiles')
    .update({ verification_status: 'approved' })
    .eq('id', specialistId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

export async function rejectSpecialistAction(formData: FormData) {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const specialistId = String(formData.get('specialist_id'));

  const { error } = await supabase
    .from('specialist_profiles')
    .update({ verification_status: 'rejected' })
    .eq('id', specialistId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}
