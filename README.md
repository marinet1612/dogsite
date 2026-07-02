# Dogram — fullstack MVP для владельцев собак и кинологов

Dogram — рабочая fullstack-заготовка сервиса для владельцев собак и кинологов. Внутри есть frontend на Next.js, backend-логика через server actions, база PostgreSQL в Supabase, SQL-миграция, seed-данные, роли, заявки, карточки собак, прогулки и чат.

## Что реализовано

- Авторизация через Supabase Auth.
- Роли: владелец, кинолог, администратор.
- Мягкий pet-care UI.
- Лендинг.
- Кабинет владельца.
- Карточки собак.
- Дневник прогресса.
- Каталог кинологов по Санкт-Петербургу.
- Профили кинологов.
- Заявки кинологу.
- Прогулки и запросы на участие.
- Чаты: по заявке, по прогулке и личные диалоги.
- База знаний.
- Промокоды.
- Базовая админ-панель.
- RLS-политики Supabase.
- Supabase Realtime для таблицы messages.

## Стек

- Next.js App Router
- TypeScript
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase Realtime
- Tailwind CSS
- lucide-react
- zod

## Быстрый запуск

1. Установить Node.js.
2. Создать проект в Supabase.
3. В Supabase SQL Editor выполнить файл:

```bash
supabase/migrations/0001_initial.sql
```

4. Затем выполнить seed-данные:

```bash
supabase/seed.sql
```

5. Скопировать `.env.example` в `.env.local`:

```bash
cp .env.example .env.local
```

6. Заполнить переменные:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_NAME=Dogram
NEXT_PUBLIC_APP_CITY=Санкт-Петербург
```

7. Установить зависимости и запустить проект:

```bash
npm install
npm run dev
```

8. Открыть:

```bash
http://localhost:3000
```

## Важно про ключи Supabase

`NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` можно использовать на клиенте.

`SUPABASE_SERVICE_ROLE_KEY` нельзя публиковать, коммитить в GitHub или вставлять в frontend-код. В текущем проекте он зарезервирован для будущих admin/server-only операций. Для MVP основные операции работают через RLS и пользовательскую сессию.


## Как назначить администратора

Публичная регистрация не выдаёт роль `admin`. Это сделано специально, чтобы любой пользователь не мог получить доступ к модерации.

После регистрации нужного пользователя выполните в Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

После этого пользователь сможет открыть `/admin`.

## Где менять бренд

Название сервиса берётся из переменной:

```env
NEXT_PUBLIC_APP_NAME=Dogram
```

Также можно поменять `BRAND_NAME` в `src/lib/config.ts`.

## Как устроен чат

Чаты сделаны через четыре таблицы:

- `conversations` — сам диалог;
- `conversation_members` — участники;
- `messages` — сообщения;
- `message_attachments` — вложения.

У диалога есть тип:

- `request` — чат по заявке к кинологу;
- `walk` — чат по прогулке;
- `direct` — личный чат между владельцами или владельцем и кинологом;
- `support` — будущий чат с поддержкой.

Сообщения можно привязывать к заявке или прогулке. Это позволит владельцу возвращаться к рекомендациям кинолога и истории договорённостей.

## Дальнейшие шаги

1. Подключить Supabase Storage для реальной загрузки фото/видео.
2. Добавить email-подтверждение и восстановление пароля.
3. Добавить публичную страницу каждого кинолога.
4. Добавить карту прогулок.
5. Добавить рейтинги и отзывы.
6. Добавить оплату занятий после проверки спроса.
7. Добавить полноценную модерацию медиа и сообщений.
