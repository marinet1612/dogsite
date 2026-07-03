import Link from 'next/link';
import {
  BadgeCheck,
  MapPin,
  Star,
  WalletCards
} from 'lucide-react';

import type { SpecialistProfile } from '@/lib/types';
import { SoftTag } from '@/components/ui';

export function SpecialistCard({
  specialist
}: {
  specialist: SpecialistProfile;
}) {
  const specializations =
    specialist.specializations?.map(
      (item) => item.specialization_type
    ) || [];

  const hasRating =
    specialist.rating !== null &&
    specialist.rating !== undefined &&
    Number(specialist.rating) > 0;

  const hasPrice =
    specialist.price_from !== null &&
    specialist.price_from !== undefined &&
    Number(specialist.price_from) > 0;

  return (
    <article className="card transition hover:-translate-y-1 hover:bg-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-cocoa">
              {specialist.public_name}
            </h3>

            {specialist.verification_status === 'approved' && (
              <BadgeCheck
                className="text-emerald-600"
                size={20}
                aria-label="Специалист подтверждён"
              />
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-sm text-cocoa/60">
            <span className="inline-flex items-center gap-1">
              <MapPin size={15} />
              {specialist.city}
            </span>

            <span className="inline-flex items-center gap-1">
              <Star size={15} />
              {hasRating
                ? Number(specialist.rating).toFixed(1)
                : 'Нет оценок'}
            </span>

            <span className="inline-flex items-center gap-1">
              <WalletCards size={15} />
              {hasPrice
                ? `от ${specialist.price_from} ₽`
                : 'Цена не указана'}
            </span>
          </div>
        </div>
      </div>

      {specialist.description ? (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-cocoa/65">
          {specialist.description}
        </p>
      ) : (
        <p className="mt-4 text-sm text-cocoa/45">
          Специалист пока не добавил описание.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {specializations.slice(0, 4).map((item) => (
          <SoftTag tone="orange" key={item}>
            {item}
          </SoftTag>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          className="btn-primary flex-1"
          href={`/specialists/${specialist.id}`}
        >
          Открыть профиль
        </Link>

        <Link
          className="btn-secondary"
          href={`/specialists/${specialist.id}#request`}
        >
          Заявка
        </Link>
      </div>
    </article>
  );
}
