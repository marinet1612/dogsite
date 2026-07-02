'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types';
import { MVP_CITY } from '@/lib/config';

export async function signUpAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const fullName = String(formData.get('full_name') || '').trim();
  const requestedRole = String(formData.get('role') || 'owner') as UserRole;
  const role: UserRole = requestedRole === 'specialist' ? 'specialist' : 'owner';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role
      }
    }
  });

  if (error) throw new Error(error.message);

  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      role,
      full_name: fullName,
      city: MVP_CITY
    });
  }

  redirect(role === 'specialist' ? '/specialist' : '/owner');
}

export async function signInAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  if (profile?.role === 'admin') redirect('/admin');
  if (profile?.role === 'specialist') redirect('/specialist');
  redirect('/owner');
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}
