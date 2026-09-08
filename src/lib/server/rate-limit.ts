import { adminClient } from "../supabase/server";
import { hashToken } from "./crypto";
import { required, AppError } from "./errors";
import { checked } from "./http";
export async function rateLimit(key: string, limit: number, seconds: number) {
  const ok = checked(
    await adminClient().rpc("take_rate", {
      p_key: key,
      p_limit: limit,
      p_seconds: seconds,
    }),
  );
  if (!ok)
    throw new AppError(
      "Too many requests. Please wait before trying again.",
      429,
      "rate_limited",
    );
}
export function requestIdentity(request: Request) {
  const ip = process.env.VERCEL
    ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    : "local-development";
  return hashToken(`${required("RATE_LIMIT_SALT")}|${ip}`);
}
