'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types';

function getEmail(formData: FormData) {
  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase();

  if (!email || !email.includes('@')) {
    throw new Error('Введите корректный адрес электронной почты');
  }

  return email;
}

function getPassword(formData: FormData) {
  const password = String(formData.get('password') || '');

  if (password.length < 8) {
    throw new Error('Пароль должен содержать не менее 8 символов');
  }

  return password;
}

export async function signUpAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const email = getEmail(formData);
  const password = getPassword(formData);
  const fullName = String(
    formData.get('full_name') || ''
  ).trim();

  if (fullName.length < 2 || fullName.length > 100) {
    throw new Error('Укажите имя длиной от 2 до 100 символов');
  }

  const requestedRole = String(
    formData.get('role') || 'owner'
  );

  const role: UserRole =
    requestedRole === 'specialist'
      ? 'specialist'
      : 'owner';

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

  if (error) {
    console.error('signUpAction:', error);
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Не удалось создать пользователя');
  }

  /*
   * Профиль уже создаётся SQL-триггером handle_new_user.
   * Повторный upsert здесь не нужен.
   */

  if (!data.session) {
    redirect('/login?registered=1');
  }

  redirect(
    role === 'specialist'
      ? '/specialist'
      : '/owner'
  );
}

export async function signInAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const email = getEmail(formData);
  const password = String(
    formData.get('password') || ''
  );

  if (!password) {
    throw new Error('Введите пароль');
  }

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    console.error('signInAction:', error);
    throw new Error('Неверная почта или пароль');
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Не удалось получить данные пользователя');
  }

  const { data: profile, error: profileError } =
    await supabase
      .from('profiles')
      .select('role, is_blocked')
      .eq('id', user.id)
      .maybeSingle();

  if (profileError || !profile) {
    console.error('signInAction profile:', profileError);
    await supabase.auth.signOut();
    throw new Error('Профиль пользователя не найден');
  }

  if (profile.is_blocked) {
    await supabase.auth.signOut();
    throw new Error('Учётная запись заблокирована');
  }

  if (profile.role === 'admin') {
    redirect('/admin');
  }

  if (profile.role === 'specialist') {
    redirect('/specialist');
  }

  redirect('/owner');
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('signOutAction:', error);
  }

  redirect('/');
}
