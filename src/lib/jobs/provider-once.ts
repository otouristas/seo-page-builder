import "server-only";
import { NonRetriableError } from "inngest";
import { adminClient } from "../supabase/server";
import { checked } from "../server/http";
import { AppError } from "../server/errors";
// A network timeout can hide a successful billable call. Never replay that call
// automatically. Reuse a saved response, or leave an explicit reconciliation case.
export async function providerOnce<T>(
  jobId: string,
  operation: string,
  call: () => Promise<T>,
): Promise<T> {
  const db = adminClient();
  const claim = await db
    .from("provider_receipts")
    .insert({ job_id: jobId, operation, status: "started" });
  if (claim.error) {
    if (claim.error.code !== "23505") checked(claim);
    const prior = checked(
      await db
        .from("provider_receipts")
        .select("status,response")
        .eq("job_id", jobId)
        .eq("operation", operation)
        .single(),
    );
    if (prior?.status === "completed") return prior.response as T;
    throw new NonRetriableError(
      "A previous provider request has an uncertain outcome. Automatic replay was stopped to prevent duplicate provider charges.",
    );
  }
  try {
    const result = await call();
    checked(
      await db
        .from("provider_receipts")
        .update({ status: "completed", response: result })
        .eq("job_id", jobId)
        .eq("operation", operation),
    );
    return result;
  } catch (error) {
    if (
      error instanceof AppError &&
      ["provider_rate_limit", "provider_auth"].includes(error.code)
    )
      await db
        .from("provider_receipts")
        .delete()
        .eq("job_id", jobId)
        .eq("operation", operation);
    throw error;
  }
}
