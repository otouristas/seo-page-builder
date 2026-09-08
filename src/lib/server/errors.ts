export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = "request_failed",
  ) {
    super(message);
  }
}
export function required(name: string) {
  const v = process.env[name];
  if (!v)
    throw new AppError(
      "This integration is not configured yet. Your existing results are still available.",
      503,
      "integration_unconfigured",
    );
  return v;
}
