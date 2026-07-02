import Link from 'next/link';
import { createSupabaseServerClient, requireUser } from '@/lib/supabase/server';
import { createDogAction, createProgressEntryAction } from '@/lib/actions/dogs';
import { EmptyState, SoftTag } from '@/components/ui';
import {
  DOG_ACTIVITY_LEVELS,
  DOG_BREEDS,
  DOG_SIZES,
  SPB_DISTRICTS,
  SPB_METRO_STATIONS
} from '@/lib/dog-options';

const activityLabels: Record<string, string> = {
  low: 'Спокойная',
  medium: 'Средняя активность',
  high: 'Очень активная'
};

const sizeLabels: Record<string, string> = {
  small: 'Маленькая',
  medium: 'Средняя',
  large: 'Крупная',
  giant: 'Очень крупная'
};

const sexLabels: Record<string, string> = {
  female: 'Девочка',
  male: 'Мальчик',
  unknown: 'Не указано'
};

function getDogAgeLabel(ageMonths?: number | null) {
  if (!ageMonths) {
    return 'возраст не указан';
  }

  if (ageMonths < 12) {
    return `${ageMonths} мес.`;
  }

  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;

  if (!months) {
    return `${years} г.`;
  }

  return `${years} г. ${months} мес.`;
}

export default async function OwnerDashboardPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const [{ data: dogs }, { data: requests }, { data: progress }] = await Promise.all([
    supabase
      .from('dog_profiles')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('owner_requests')
      .select('*, specialist_profiles(public_name)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('progress_entries')
      .select('*, dog_profiles(name)')
      .eq('owner_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(5)
  ]);

  const hasDogs = Boolean(dogs?.length);
  const currentDog = dogs?.[0];

  return (
    <main className="container-page py-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="badge mb-4">Кабинет владельца</div>
          <h1 className="section-title">Питомцы, заявки и прогресс</h1>
          <p className="section-subtitle">
            Главная карточка питомца теперь отображается сразу. Форму добавления можно открыть отдельно, если нужно добавить ещё одну собаку.
          </p>
        </div>

        <Link href="/specialists" className="btn-primary">
          Найти кинолога
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <section className="card">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-2xl font-black text-cocoa">
                Актуальная карточка питомца
              </h2>
              <p className="mt-2 text-sm text-cocoa/55">
                Последняя созданная карточка отображается как основная.
              </p>
            </div>

            {hasDogs ? (
              <SoftTag tone="green">
                {dogs?.length} питомец(а)
              </SoftTag>
            ) : null}
          </div>

          {currentDog ? (
            <div className="mt-6 rounded-[2rem] bg-gradient-to-br from-white via-white/80 to-mint/20 p-6 shadow-soft">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <div className="text-sm font-bold uppercase tracking-[0.2em] text-cocoa/40">
                    {currentDog.breed || 'Порода не указана'}
                  </div>

                  <h3 className="mt-2 text-3xl font-black text-cocoa">
                    {currentDog.name}
                  </h3>

                  <p className="mt-2 text-sm text-cocoa/55">
                    {sexLabels[currentDog.sex] || currentDog.sex || 'Пол не указан'} · {getDogAgeLabel(currentDog.age_months)} · {currentDog.weight ? `${currentDog.weight} кг` : 'вес не указан'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <SoftTag tone="blue">
                    {sizeLabels[currentDog.size] || currentDog.size || 'Размер не указан'}
                  </SoftTag>
                  <SoftTag tone="purple">
                    {activityLabels[currentDog.activity_level] || currentDog.activity_level || 'Активность не указана'}
                  </SoftTag>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-3xl bg-white/70 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa/40">
                    Район
                  </div>
                  <div className="mt-1 font-bold text-cocoa">
                    {currentDog.district || 'Не указан'}
                  </div>
                </div>

                <div className="rounded-3xl bg-white/70 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa/40">
                    Метро
                  </div>
                  <div className="mt-1 font-bold text-cocoa">
                    {currentDog.metro_station || 'Не указано'}
                  </div>
                </div>
              </div>

              {currentDog.description ? (
                <p className="mt-5 rounded-3xl bg-white/70 p-4 text-sm leading-6 text-cocoa/65">
                  {currentDog.description}
                </p>
              ) : (
                <p className="mt-5 rounded-3xl bg-white/70 p-4 text-sm leading-6 text-cocoa/40">
                  Особенности поведения пока не описаны.
                </p>
              )}
            </div>
          ) : (
            <EmptyState
              title="Карточка питомца ещё не создана"
              text="Создайте первую карточку собаки, чтобы пользоваться подбором кинолога, дневником прогресса и прогулками."
            />
          )}

          {dogs && dogs.length > 1 ? (
            <div className="mt-6">
              <h3 className="text-lg font-black text-cocoa">
                Остальные питомцы
              </h3>

              <div className="mt-3 grid gap-3">
                {dogs.slice(1).map((dog) => (
                  <div className="rounded-3xl bg-white/70 p-4" key={dog.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-black text-cocoa">
                          {dog.name}
                        </h4>
                        <p className="mt-1 text-sm text-cocoa/55">
                          {dog.breed || 'Порода не указана'} · {dog.district || 'район не указан'}{dog.metro_station ? ` · м. ${dog.metro_station}` : ''}
                        </p>
                      </div>

                      <SoftTag tone="green">
                        {activityLabels[dog.activity_level] || dog.activity_level || 'medium'}
                      </SoftTag>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="card">
          <details open={!hasDogs} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-3xl bg-paw/10 px-5 py-4 transition hover:bg-paw/15">
              <div>
                <h2 className="text-2xl font-black text-cocoa">
                  {hasDogs ? 'Добавить питомца' : 'Создать карточку питомца'}
                </h2>
                <p className="mt-1 text-sm text-cocoa/55">
                  {hasDogs
                    ? 'Форма скрыта. Откройте её, если у вас несколько собак.'
                    : 'Заполните основные данные о собаке.'}
                </p>
              </div>

              <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-cocoa shadow-soft">
                {hasDogs ? '+' : 'Начать'}
              </span>
            </summary>

            <form action={createDogAction} className="mt-5 grid gap-4">
              <input
                className="input"
                name="name"
                placeholder="Имя собаки"
                required
              />

              <select className="input" name="breed" required defaultValue="">
                <option value="" disabled>
                  Выберите породу
                </option>
                {DOG_BREEDS.map((breed) => (
                  <option value={breed} key={breed}>
                    {breed}
                  </option>
                ))}
              </select>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="input"
                  name="age_months"
                  placeholder="Возраст, мес."
                  type="number"
                  min="0"
                />

                <input
                  className="input"
                  name="weight"
                  placeholder="Вес, кг"
                  type="number"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <select className="input" name="sex" defaultValue="unknown">
                  <option value="female">Девочка</option>
                  <option value="male">Мальчик</option>
                  <option value="unknown">Не указано</option>
                </select>

                <select className="input" name="size" defaultValue="medium">
                  {DOG_SIZES.map((size) => (
                    <option value={size.value} key={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              <select className="input" name="activity_level" defaultValue="medium">
                {DOG_ACTIVITY_LEVELS.map((level) => (
                  <option value={level.value} key={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <input
                    className="input"
                    name="district"
                    list="spb-districts"
                    placeholder="Район Санкт-Петербурга"
                    autoComplete="off"
                  />

                  <datalist id="spb-districts">
                    {SPB_DISTRICTS.map((district) => (
                      <option value={district} key={district} />
                    ))}
                  </datalist>

                  <p className="mt-2 text-xs text-cocoa/45">
                    Можно выбрать из списка или ввести свой вариант.
                  </p>
                </div>

                <div>
                  <input
                    className="input"
                    name="metro_station"
                    list="spb-metro-stations"
                    placeholder="Ближайшее метро"
                    autoComplete="off"
                  />

                  <datalist id="spb-metro-stations">
                    {SPB_METRO_STATIONS.map((station) => (
                      <option value={station} key={station} />
                    ))}
                  </datalist>

                  <p className="mt-2 text-xs text-cocoa/45">
                    При вводе список будет сокращаться автоматически.
                  </p>
                </div>
              </div>

              <textarea
                className="input min-h-28"
                name="description"
                placeholder="Особенности поведения, триггеры, задачи"
              />

              <button className="btn-primary" type="submit">
                Сохранить карточку
              </button>
            </form>
          </details>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="text-2xl font-black text-cocoa">
            Последние заявки
          </h2>

          <div className="mt-5 space-y-3">
            {requests?.length ? (
              requests.slice(0, 4).map((request) => (
                <div className="rounded-3xl bg-white/70 p-4" key={request.id}>
                  <div className="flex justify-between gap-3">
                    <b>{request.problem_type}</b>
                    <SoftTag tone="blue">{request.status}</SoftTag>
                  </div>

                  <p className="mt-1 text-sm text-cocoa/55">
                    Кинолог: {request.specialist_profiles?.public_name}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="Заявок пока нет"
                text="Откройте каталог кинологов и отправьте первую заявку."
              />
            )}
          </div>
        </section>

        <section className="card">
          <h2 className="text-2xl font-black text-cocoa">
            Добавить запись прогресса
          </h2>

          {dogs?.length ? (
            <form action={createProgressEntryAction} className="mt-5 grid gap-4">
              <select className="input" name="dog_id" required>
                {dogs.map((dog) => (
                  <option value={dog.id} key={dog.id}>
                    {dog.name}
                  </option>
                ))}
              </select>

              <input
                className="input"
                name="title"
                placeholder="Например: спокойная параллельная прогулка"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <select className="input" name="problem_type">
                  <option value="reactivity">Реактивность</option>
                  <option value="leash_pulling">Тянет поводок</option>
                  <option value="separation_anxiety">Тревога разлуки</option>
                  <option value="fear">Страхи</option>
                  <option value="household_behavior">Бытовое поведение</option>
                </select>

                <input className="input" name="entry_date" type="date" />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <input
                  className="input"
                  name="reaction_level"
                  placeholder="Реакция 1-5"
                  type="number"
                  min="1"
                  max="5"
                />

                <input
                  className="input"
                  name="condition_score"
                  placeholder="Состояние 1-5"
                  type="number"
                  min="1"
                  max="5"
                />

                <input
                  className="input"
                  name="trigger_distance"
                  placeholder="Дистанция, м"
                  type="number"
                />
              </div>

              <textarea
                className="input min-h-24"
                name="description"
                placeholder="Что произошло, что помогло, что повторить"
              />

              <button className="btn-primary" type="submit">
                Добавить запись
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-cocoa/60">
              Сначала создайте карточку собаки.
            </p>
          )}

          <div className="mt-5 space-y-2">
            {progress?.map((entry) => (
              <div className="rounded-2xl bg-white/70 p-3 text-sm" key={entry.id}>
                {entry.entry_date}: {entry.title || entry.problem_type}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
