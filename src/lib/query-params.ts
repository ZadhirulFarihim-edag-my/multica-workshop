export function getQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function parsePage(value: string | string[] | undefined, fallback = 1) {
  const parsed = Number.parseInt(getQueryValue(value) ?? "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parseString(value: string | string[] | undefined) {
  const parsed = getQueryValue(value)?.trim();

  return parsed ? parsed : undefined;
}

export function mergeSearchParams(
  current: Record<string, string | string[] | undefined>,
  next: Record<string, string | number | undefined>
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(current)) {
    const currentValue = getQueryValue(value);

    if (currentValue) {
      params.set(key, currentValue);
    }
  }

  for (const [key, value] of Object.entries(next)) {
    if (value === undefined || value === "") {
      params.delete(key);
      continue;
    }

    params.set(key, String(value));
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}
