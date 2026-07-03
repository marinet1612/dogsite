'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createSupabaseServerClient,
  requireUser
} from '@/lib/supabase/server';

import { MVP_CITY } from '@/lib/config';
import { requireDogOwner } from '@/lib/authz';

import {
  numberInRange,
  oneOf,
  optionalText,
  requiredText
} from '@/lib/validation';

const DOG_SEXES = [
  'female',
  'male',
  'unknown'
] as const;

const DOG_SIZES = [
  'small',
  'medium',
  'large',
  'giant'
] as const;

const ACTIVITY_LEVELS = [
  'low',
  'medium',
  'high'
] as const;

const ENTRY_TYPES = [
