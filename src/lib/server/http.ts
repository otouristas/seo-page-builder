import { readTextLimited } from "./body";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AppError } from "./errors";
import { CANONICAL_URL, SITE_URL } from "../utils";
import * as Sentry from "@sentry/nextjs";
export function assertOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowedOrigins = new Set([
    new URL(SITE_URL).origin,
    new URL(CANONICAL_URL).origin,
    "https://ranksushi.vercel.app",
  ]);
  if (process.env.NODE_ENV !== "production")
    allowedOrigins.add("http://localhost:3100");
  if (!origin || !allowedOrigins.has(origin))
    throw new AppError("The request origin is not allowed.", 403);
}
export async function readJson<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  const text = await readTextLimited(request);
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new AppError("Send valid JSON.", 400);
  }
  return schema.parse(body);
}
export function api(
  handler: (
    request: Request,
    context: { params: Promise<Record<string, string>> },
  ) => Promise<Response>,
) {
  return async (
    request: Request,
    context: { params: Promise<Record<string, string>> },
  ) => {
    try {
      if (!["GET", "HEAD"].includes(request.method)) assertOrigin(request);
      const response = await handler(request, context);
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    } catch (error) {
      if (error instanceof AppError)
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.status, headers: { "Cache-Control": "no-store" } },
        );
      if (error instanceof z.ZodError)
        return NextResponse.json(
          {
            error: error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; "),
          },
          { status: 400 },
        );
      Sentry.captureException(error);
      return NextResponse.json(
        {
          error: "The request could not be completed. Please try again.",
          code: "internal_error",
        },
        { status: 500 },
      );
    }
  };
}
export function checked<T>(result: {
  data: T;
  error: { message: string } | null;
}): T {
  if (result.error)
    throw new AppError(
      "Database operation failed. Check that the RankSushi migration is installed.",
      503,
      "database_unavailable",
    );
  return result.data;
}
