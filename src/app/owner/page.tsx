import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  createSupabaseServerClient,
  requireUser
} from '@/lib/supabase/server';

import { updateDogAction } from '@/lib/actions/dogs';
import { LocationSelects } from '@/components/location-selects';

type EditDogPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditDogPage({
  params
}: EditDogPageProps) {
  const { id } = await params;

  const user = await requireUser();
  const supabase =
    await createSupabaseServerClient();

  const { data: dog, error } = await supabase
    .from('dog_profiles')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .maybeSingle();

  if (error || !dog) {
    notFound();
  }

  return (
    <main className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <div className="badge mb-4">
          Редактирование питомца
        </div>

        <h1 className="section-title">
          {dog.name}
        </h1>

        <p className="section-subtitle">
          Измените информацию о собаке и
          сохраните карточку.
        </p>

        <form
          action={updateDogAction}
          className="card mt-8 grid gap-5"
        >
          <input
            type="hidden"
            name="dog_id"
            value={dog.id}
          />

          <label>
            <span className="label">
              Имя собаки
            </span>

            <input
              className="input"
              name="name"
              defaultValue={dog.name || ''}
              maxLength={100}
              required
            />
          </label>

          <label>
            <span className="label">
              Порода
            </span>

            <input
              className="input"
              name="breed"
              defaultValue={dog.breed || ''}
              maxLength={150}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="label">
                Возраст в месяцах
              </span>

              <input
                className="input"
                name="age_months"
                type="number"
                min={0}
                max={360}
                defaultValue={
                  dog.age_months ?? 0
                }
              />
            </label>

            <label>
              <span className="label">
                Вес, кг
              </span>

              <input
                className="input"
                name="weight"
                type="number"
                min={0}
                max={150}
                step="0.1"
                defaultValue={
                  dog.weight ?? 0
                }
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <label>
              <span className="label">
                Пол
              </span>

              <select
                className="input"
                name="sex"
                defaultValue={
                  dog.sex || 'unknown'
                }
              >
                <option value="female">
                  Девочка
                </option>

                <option value="male">
                  Мальчик
                </option>

                <option value="unknown">
                  Не указан
                </option>
              </select>
            </label>

            <label>
              <span className="label">
                Размер
              </span>

              <select
                className="input"
                name="size"
                defaultValue={
                  dog.size || 'medium'
                }
              >
                <option value="small">
                  Маленькая
                </option>

                <option value="medium">
                  Средняя
                </option>

                <option value="large">
                  Крупная
                </option>

                <option value="giant">
                  Очень крупная
                </option>
              </select>
            </label>

            <label>
              <span className="label">
                Активность
              </span>

              <select
                className="input"
                name="activity_level"
                defaultValue={
                  dog.activity_level ||
                  'medium'
                }
              >
                <option value="low">
                  Спокойная
                </option>

                <option value="medium">
                  Средняя
                </option>

                <option value="high">
                  Высокая
                </option>
              </select>
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <LocationSelects
              defaultDistrict={
                dog.district || ''
              }
              defaultMetroStation={
                dog.metro_station || ''
              }
            />
          </div>

          <label>
            <span className="label">
              Описание
            </span>

            <textarea
              className="input min-h-32"
              name="description"
              maxLength={3000}
              defaultValue={
                dog.description || ''
              }
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              className="btn-primary"
              type="submit"
            >
              Сохранить изменения
            </button>

            <Link
              className="btn-secondary"
              href="/owner"
            >
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
