export function parseIntegerOption(
  value: string | undefined,
  name: string,
  defaultValue: number,
  options: { min?: number; max?: number } = {},
): number {
  const rawValue = value ?? String(defaultValue);

  if (!/^-?\d+$/.test(rawValue)) {
    throw new Error(`${name} must be an integer.`);
  }

  const parsed = Number(rawValue);

  if (options.min !== undefined && parsed < options.min) {
    throw new Error(`${name} must be at least ${options.min}.`);
  }

  if (options.max !== undefined && parsed > options.max) {
    throw new Error(`${name} must be at most ${options.max}.`);
  }

  return parsed;
}

export function validateDateOption(value: string, name: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${name} must use yyyy-MM-dd format.`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`${name} must be a valid date.`);
  }

  return value;
}

export function parseUnixTimestampOption(value: string, name: string): number {
  if (!/^\d+$/.test(value)) {
    throw new Error(`${name} must be a Unix timestamp.`);
  }

  return Number(value);
}
