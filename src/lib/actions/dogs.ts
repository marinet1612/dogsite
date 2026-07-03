'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient, requireUser } from '@/lib/supabase/server';
import { MVP_CITY } from '@/lib/config';
import { requireDogOwner } from '@/lib/authz';
import {
  numberInRange,
  oneOf,
  optionalText,
  requiredText
} from '@/lib/validation';

const DOG_SEXES = ['female', 'male', 'unknown'] as const;
const DOG_SIZES = ['small', 'medium', 'large', 'giant'] as const;
const ACTIVITY_LEVELS = ['low', 'medium', 'high'] as const;

const ENTRY_TYPES = [
  'training',
  'walk',
  'observation',
  'health'
] as const;

const PROBLEM_TYPES = [
  'reactivity',
  'leash_pulling',
  'separation_anxiety',
  'puppy',
  'other'
] as const;

export async function createDogAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const payload = {
    owner_id: user.id,
    name: requiredText(formData.get('name'), 'Имя', 100),
    breed: optionalText(formData.get('breed'), 150),

    age_months: numberInRange(
      formData.get('age_months'),
      'Возраст',
      0,
      360
    ),

    sex: oneOf(
      formData.get('sex') || 'unknown',
      DOG_SEXES,
      'Пол'
    ),

    weight: numberInRange(
      formData.get('weight'),
      'Вес',
      0,
      150
    ),

    size: oneOf(
      formData.get('size') || 'medium',
      DOG_SIZES,
      'Размер'
    ),

    activity_level: oneOf(
      formData.get('activity_level') || 'medium',
      ACTIVITY_LEVELS,
      'Активность'
    ),

    city: MVP_CITY,
    district: optionalText(formData.get('district'), 120),
    metro_station: optionalText(formData.get('metro_station'), 120),
    description: optionalText(formData.get('description'), 3000)
  };

  const { error } = await supabase
    .from('dog_profiles')
    .insert(payload);

  if (error) {
    console.error('createDogAction:', error);
    throw new Error('Не удалось создать карточку собаки');
  }

  revalidatePath('/owner');
}

export async function createProgressEntryAction(
  formData: FormData
) {
  const dogId = requiredText(
    formData.get('dog_id'),
    'Собака',
    100
  );

  const { user, supabase } = await requireDogOwner(dogId);

  const rawEntryDate = requiredText(
    formData.get('entry_date') ||
      new Date().toISOString().slice(0, 10),
    'Дата',
    20
  );

  const entryDate = new Date(`${rawEntryDate}T00:00:00`);

  if (Number.isNaN(entryDate.getTime())) {
    throw new Error('Укажите корректную дату');
  }

  const payload = {
    owner_id: user.id,
    dog_id: dogId,

    entry_type: oneOf(
      formData.get('entry_type') || 'training',
      ENTRY_TYPES,
      'Тип записи'
    ),

    problem_type: oneOf(
      formData.get('problem_type') || 'reactivity',
      PROBLEM_TYPES,
      'Тип проблемы'
    ),

    title: requiredText(
      formData.get('title'),
      'Заголовок',
      150
    ),

    description: optionalText(
      formData.get('description'),
      3000
    ),

    reaction_level: numberInRange(
      formData.get('reaction_level') || 3,
      'Уровень реакции',
      1,
      5
    ),

    condition_score: numberInRange(
      formData.get('condition_score') || 3,
      'Состояние',
      1,
      5
    ),

    trigger_distance: numberInRange(
      formData.get('trigger_distance') || 0,
      'Дистанция',
      0,
      10_000
    ),

    duration_minutes: numberInRange(
      formData.get('duration_minutes') || 0,
      'Продолжительность',
      0,
      1440
    ),

    entry_date: rawEntryDate
  };

  const { error } = await supabase
    .from('progress_entries')
    .insert(payload);

  if (error) {
    console.error('createProgressEntryAction:', error);
    throw new Error('Не удалось добавить запись прогресса');
  }

  revalidatePath('/owner/progress');
  revalidatePath('/owner');
}
