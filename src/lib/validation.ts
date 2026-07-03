export function requiredText(
  value: unknown,
  label: string,
  maxLength = 500
): string {
  const text = String(value ?? '').trim();

  if (!text) {
    throw new Error(`Заполните поле «${label}»`);
  }

  if (text.length > maxLength) {
    throw new Error(`Поле «${label}» слишком длинное`);
  }

  return text;
}

export function optionalText(
  value: unknown,
  maxLength = 2000
): string {
  const text = String(value ?? '').trim();

  if (text.length > maxLength) {
    throw new Error('Текст слишком длинный');
  }

  return text;
}

export function numberInRange(
  value: unknown,
  label: string,
  min: number,
  max: number
): number {
  const normalizedValue =
    typeof value === 'string'
      ? value.trim()
      : value;

  if (
    normalizedValue === '' ||
    normalizedValue === null ||
    normalizedValue === undefined
  ) {
    throw new Error(`Заполните поле «${label}»`);
  }

  const number = Number(normalizedValue);

  if (
    !Number.isFinite(number) ||
    number < min ||
    number > max
  ) {
    throw new Error(`Некорректное значение поля «${label}»`);
  }

  return number;
}

export function oneOf<
  const T extends readonly string[]
>(
  value: unknown,
  allowed: T,
  label: string
): T[number] {
  const result = String(value ?? '');

  if (!allowed.includes(result)) {
    throw new Error(
      `Некорректное значение поля «${label}»`
    );
  }

  return result as T[number];
}
