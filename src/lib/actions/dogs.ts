'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient, requireUser } from '@/lib/supabase/server';
import { MVP_CITY } from '@/lib/config';

export async function createDogAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const payload = {
    owner_id: user.id,
    name: String(formData.get('name') || '').trim(),
    breed: String(formData.get('breed') || '').trim(),
    age_months: Number(formData.get('age_months') || 0),
    sex: String(formData.get('sex') || 'unknown'),
    weight: Number(formData.get('weight') || 0),
    size: String(formData.get('size') || 'medium'),
    activity_level: String(formData.get('activity_level') || 'medium'),
    city: MVP_CITY,
    district: String(formData.get('district') || '').trim(),
    description: String(formData.get('description') || '').trim()
  };

  const { error } = await supabase.from('dog_profiles').insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath('/owner');
}

export async function createProgressEntryAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const payload = {
    owner_id: user.id,
    dog_id: String(formData.get('dog_id')),
    entry_type: String(formData.get('entry_type') || 'training'),
    problem_type: String(formData.get('problem_type') || 'reactivity'),
    title: String(formData.get('title') || '').trim(),
    description: String(formData.get('description') || '').trim(),
    reaction_level: Number(formData.get('reaction_level') || 3),
    condition_score: Number(formData.get('condition_score') || 3),
    trigger_distance: Number(formData.get('trigger_distance') || 0),
    duration_minutes: Number(formData.get('duration_minutes') || 0),
    entry_date: String(formData.get('entry_date') || new Date().toISOString().slice(0, 10))
  };

  const { error } = await supabase.from('progress_entries').insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath('/owner/progress');
  revalidatePath('/owner');
}
