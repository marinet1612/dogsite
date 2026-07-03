begin;

-- Запрещаем любому авторизованному пользователю добавлять
-- произвольных участников в любые разговоры.
drop policy if exists
  "conversation members insert authenticated"
  on public.conversation_members;

create policy "conversation members secure insert"
on public.conversation_members
for insert
with check (
  user_id = auth.uid()

  or public.is_admin()

  or exists (
    select 1
    from public.conversations c
    join public.owner_requests r
      on r.id = c.owner_request_id
    left join public.specialist_profiles s
      on s.id = r.specialist_id
    where c.id = conversation_id
      and (
        r.owner_id = auth.uid()
        or s.user_id = auth.uid()
      )
  )

  or exists (
    select 1
    from public.conversations c
    join public.walks w
      on w.id = c.walk_id
    where c.id = conversation_id
      and w.creator_id = auth.uid()
  )
);

-- Безопасное создание личного чата.
create or replace function public.create_direct_conversation(
  target_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  new_conversation_id uuid;
begin
  if current_user_id is null then
    raise exception 'Требуется авторизация';
  end if;

  if target_user_id is null then
    raise exception 'Получатель не указан';
  end if;

  if target_user_id = current_user_id then
    raise exception 'Нельзя создать чат с самим собой';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = target_user_id
      and not is_blocked
  ) then
    raise exception 'Пользователь не найден';
  end if;

  insert into public.conversations (
    type,
    title
  )
  values (
    'direct',
    'Личный чат'
  )
  returning id into new_conversation_id;

  insert into public.conversation_members (
    conversation_id,
    user_id
  )
  values
    (new_conversation_id, current_user_id),
    (new_conversation_id, target_user_id);

  return new_conversation_id;
end;
$$;

revoke all
on function public.create_direct_conversation(uuid)
from public;

grant execute
on function public.create_direct_conversation(uuid)
to authenticated;

-- Исправляем изменение статуса участника прогулки.
drop policy if exists
  "walk participants related"
  on public.walk_participants;

create policy "walk participants read"
on public.walk_participants
for select
using (
  user_id = auth.uid()

  or exists (
    select 1
    from public.walks w
    where w.id = walk_id
      and w.creator_id = auth.uid()
  )

  or public.is_admin()
);

create policy "walk participants request"
on public.walk_participants
for insert
with check (
  user_id = auth.uid()

  and exists (
    select 1
    from public.dog_profiles d
    where d.id = dog_id
      and d.owner_id = auth.uid()
  )
);

create policy "walk participants update"
on public.walk_participants
for update
using (
  user_id = auth.uid()

  or exists (
    select 1
    from public.walks w
    where w.id = walk_id
      and w.creator_id = auth.uid()
  )

  or public.is_admin()
)
with check (
  user_id = auth.uid()

  or exists (
    select 1
    from public.walks w
    where w.id = walk_id
      and w.creator_id = auth.uid()
  )

  or public.is_admin()
);

create policy "walk participants delete"
on public.walk_participants
for delete
using (
  user_id = auth.uid()

  or exists (
    select 1
    from public.walks w
    where w.id = walk_id
      and w.creator_id = auth.uid()
  )

  or public.is_admin()
);

commit;
