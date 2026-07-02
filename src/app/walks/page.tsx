import { createSupabaseServerClient, getSessionUser } from '@/lib/supabase/server';
import { createWalkAction, requestWalkParticipationAction } from '@/lib/actions/walks';
import { SoftTag } from '@/components/ui';

export default async function WalksPage() {
  const supabase = await createSupabaseServerClient();
  const user = await getSessionUser();

  const [{ data: walks }, { data: dogs }] = await Promise.all([
    supabase
      .from('walks')
      .select(`
        *,
        dog_profiles(name, breed),
        profiles(full_name),
        walk_participants(id, user_id, dog_id, status)
      `)
      .order('walk_datetime', { ascending: true }),
    user
      ? supabase.from('dog_profiles').select('*').eq('owner_id', user.id)
      : Promise.resolve({ data: [] }) as any
  ]);

  return (
    <main className="container-page py-10">
      <div className="badge mb-4">Прогулки</div>

      <h1 className="section-title">
        Найти спокойную компанию рядом
      </h1>

      <p className="section-subtitle">
        В MVP прогулки работают как список встреч. Позже можно добавить карту, геолокацию и подбор по совместимости собак.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1fr]">
        <section className="card">
          <h2 className="text-2xl font-black text-cocoa">
            Создать прогулку
          </h2>

          {user ? (
            dogs && dogs.length > 0 ? (
              <form action={createWalkAction} className="mt-5 grid gap-4">
                <select className="input" name="dog_id" required>
                  {dogs.map((dog: any) => (
                    <option value={dog.id} key={dog.id}>
                      {dog.name}
                    </option>
                  ))}
                </select>

                <input
                  className="input"
                  name="district"
                  placeholder="Район"
                  required
                />

                <input
                  className="input"
                  name="meeting_place"
                  placeholder="Место встречи"
                  required
                />

                <input
                  className="input"
                  name="walk_datetime"
                  type="datetime-local"
                  required
                />

                <select className="input" name="walk_type">
                  <option value="calm">Спокойная</option>
                  <option value="parallel">Параллельная без контакта</option>
                  <option value="puppy">Для щенков</option>
                  <option value="training">Совместная тренировка</option>
                </select>

                <textarea
                  className="input min-h-24"
                  name="description"
                  placeholder="Описание условий: контакт, дистанция, темп прогулки, ограничения"
                />

                <label className="flex items-center gap-2 text-sm font-semibold text-cocoa/70">
                  <input name="contact_allowed" type="checkbox" />
                  Контакт между собаками разрешён
                </label>

                <button className="btn-primary" type="submit">
                  Создать прогулку
                </button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-cocoa/60">
                Сначала создайте карточку собаки в личном кабинете.
              </p>
            )
          ) : (
            <p className="mt-4 text-sm text-cocoa/60">
              Войдите, чтобы создать прогулку.
            </p>
          )}
        </section>

        <section className="grid gap-4">
          {walks && walks.length > 0 ? (
            walks.map((walk: any) => {
              const isCreator = Boolean(user && walk.creator_id === user.id);

              const userParticipation = walk.walk_participants?.find(
                (participant: any) => participant.user_id === user?.id
              );

              const canRequestParticipation =
                user &&
                !isCreator &&
                !userParticipation &&
                dogs &&
                dogs.length > 0;

              return (
                <article className="card" key={walk.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-cocoa">
                        {walk.district} · {walk.meeting_place}
                      </h3>

                      <p className="mt-1 text-sm text-cocoa/55">
                        {new Date(walk.walk_datetime).toLocaleString('ru-RU')}
                      </p>

                      {walk.dog_profiles ? (
                        <p className="mt-1 text-sm text-cocoa/50">
                          Организатор: {walk.dog_profiles.name}, {walk.dog_profiles.breed}
                        </p>
                      ) : null}
                    </div>

                    <SoftTag tone="green">
                      {walk.walk_type}
                    </SoftTag>
                  </div>

                  {walk.description ? (
                    <p className="mt-3 text-sm leading-6 text-cocoa/60">
                      {walk.description}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-cocoa/40">
                      Описание прогулки пока не добавлено.
                    </p>
                  )}

                  <div className="mt-4">
                    {isCreator ? (
                      <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                        Вы организатор этой прогулки
                      </div>
                    ) : userParticipation ? (
                      <div className="rounded-2xl bg-mint/15 px-4 py-3 text-sm font-bold text-cocoa">
                        Заявка уже отправлена · статус: {userParticipation.status}
                      </div>
                    ) : canRequestParticipation ? (
                      <form action={requestWalkParticipationAction} className="flex flex-col gap-3 sm:flex-row">
                        <input type="hidden" name="walk_id" value={walk.id} />

                        <select className="input sm:max-w-48" name="dog_id" required>
                          {dogs.map((dog: any) => (
                            <option value={dog.id} key={dog.id}>
                              {dog.name}
                            </option>
                          ))}
                        </select>

                        <button className="btn-primary" type="submit">
                          Запросить участие
                        </button>
                      </form>
                    ) : user && dogs?.length === 0 ? (
                      <div className="rounded-2xl bg-lavender/20 px-4 py-3 text-sm font-bold text-cocoa">
                        Чтобы участвовать в прогулках, сначала добавьте собаку
                      </div>
                    ) : !user ? (
                      <div className="rounded-2xl bg-lavender/20 px-4 py-3 text-sm font-bold text-cocoa">
                        Войдите, чтобы запросить участие
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })
          ) : (
            <article className="card">
              <h3 className="text-xl font-black text-cocoa">
                Пока нет активных прогулок
              </h3>
              <p className="mt-2 text-sm text-cocoa/60">
                Создайте первую прогулку, чтобы другие владельцы могли отправить заявку на участие.
              </p>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
