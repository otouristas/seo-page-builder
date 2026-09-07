/** Server-only environment accessor. Empty strings count as unset. */
export function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}
