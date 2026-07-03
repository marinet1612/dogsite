'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { MVP_CITY } from '@/lib/config';
import { requireRole } from '@/lib/authz';
import {
  numberInRange,
  optionalText,
  requiredText
} from '@/lib/validation';

export async function upsertSpecialistProfileAction(
  formData: FormData
) {
  const { user, supabase } =
    await requireRole(['specialist']);

  const districts = String(formData.get('districts') || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);

  const specializations = String(
    formData.get('specializations') || ''
  )
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);

  const priceFrom = numberInRange(
    formData.get('price_from') || 0,
    'Цена от',
    0,
    1_000_000
  );

  const priceTo = numberInRange(
    formData.get('price_to') || 0,
    'Цена до',
    0,
    1_000_000
  );

  if (priceTo > 0 && priceTo < priceFrom) {
    throw new Error('Цена до не может быть меньше цены от');
  }

  const { data: profile, error } = await supabase
    .from('specialist_profiles')
    .upsert(
      {
        user_id: user.id,

        public_name: requiredText(
          formData.get('public_name'),
          'Публичное имя',
          150
        ),

        city: MVP_CITY,
        districts,

        experience_years: numberInRange(
          formData.get('experience_years') || 0,
          'Опыт',
          0,
          80
        ),

        education: optionalText(
          formData.get('education'),
          2000
        ),

        description: optionalText(
          formData.get('description'),
          5000
        ),

        methods: optionalText(
          formData.get('methods'),
          3000
        ),

        price_from: priceFrom,
        price_to: priceTo,

        works_online:
          formData.get('works_online') === 'on',

        works_offline:
          formData.get('works_offline') === 'on',

        verification_status: 'pending'
      },
      {
        onConflict: 'user_id'
      }
    )
    .select('id')
    .single();

  if (error || !profile) {
    console.error('upsertSpecialistProfileAction:', error);
    throw new Error('Не удалось сохранить профиль');
  }

  const { error: deleteError } = await supabase
    .from('specialist_specializations')
    .delete()
    .eq('specialist_id', profile.id);

  if (deleteError) {
    console.error(
      'upsertSpecialistProfileAction delete:',
      deleteError
    );

    throw new Error('Не удалось обновить специализации');
  }

  if (specializations.length > 0) {
    const { error: insertError } = await supabase
      .from('specialist_specializations')
      .insert(
        specializations.map((specializationType) => ({
          specialist_id: profile.id,
          specialization_type: specializationType
        }))
      );

    if (insertError) {
      console.error(
        'upsertSpecialistProfileAction insert:',
        insertError
      );

      throw new Error('Не удалось сохранить специализации');
    }
  }

  revalidatePath('/specialist');
  revalidatePath('/specialists');
  redirect('/specialist');
}

export async function approveSpecialistAction(
  formData: FormData
) {
  const { supabase } = await requireRole(['admin']);

  const specialistId = requiredText(
    formData.get('specialist_id'),
    'Специалист',
    100
  );

  const { error } = await supabase
    .from('specialist_profiles')
    .update({
      verification_status: 'approved'
    })
    .eq('id', specialistId);

  if (error) {
    console.error('approveSpecialistAction:', error);
    throw new Error('Не удалось подтвердить специалиста');
  }

  revalidatePath('/admin');
  revalidatePath('/specialists');
}

export async function rejectSpecialistAction(
  formData: FormData
) {
  const { supabase } = await requireRole(['admin']);

  const specialistId = requiredText(
    formData.get('specialist_id'),
    'Специалист',
    100
  );

  const { error } = await supabase
    .from('specialist_profiles')
    .update({
      verification_status: 'rejected'
    })
    .eq('id', specialistId);

  if (error) {
    console.error('rejectSpecialistAction:', error);
    throw new Error('Не удалось отклонить специалиста');
  }

  revalidatePath('/admin');
  revalidatePath('/specialists');
}
