export function requiredText(
  value: FormDataEntryValue | null,
  label: string,
  max = 500
) {
  const text = String(value ?? '').trim();

  if (!text) throw new Error(`Заполните поле «${label}»`);
  if (text.length > max) throw new Error(`Поле «${label}» слишком длинное`);

  return text;
}

export function optionalText(
  value: FormDataEntryValue | null,
  max = 2000
) {
  const text = String(value ?? '').trim();

  if (text.length > max) throw new Error('Текст слишком длинный');

  return text;
}

export function numberInRange(
  value: FormDataEntryValue | null,
  label: string,
  min: number,
  max: number
) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(`Некорректное значение поля «${label}»`);
  }

  return number;
}

export function oneOf<const T extends readonly string[]>(
  value: FormDataEntryValue | null,
  allowed: T,
  label: string
): T[number] {
  const result = String(value ?? '');

  if (!allowed.includes(result)) {
    throw new Error(`Некорректное значение поля «${label}»`);
  }

  return result as T[number];
}
