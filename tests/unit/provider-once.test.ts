import { beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  receipts: new Map<string, { status: string; response?: unknown }>(),
  failSave: false,
}));
vi.mock("@/lib/supabase/server", () => ({
  adminClient: () => ({
    from: () => ({
      insert: async (r: {
        job_id: string;
        operation: string;
        status: string;
      }) => {
        const key = r.job_id + r.operation;
        if (state.receipts.has(key))
          return { error: { code: "23505", message: "duplicate" }, data: null };
        state.receipts.set(key, { status: r.status });
        return { error: null, data: null };
      },
      select: () => {
        let key = "";
        const chain = {
          eq: (_f: string, v: string) => {
            key += v;
            return chain;
          },
          single: async () => ({ data: state.receipts.get(key), error: null }),
        };
        return chain;
      },
      update: (value: Record<string, unknown>) => {
        let key = "";
        const chain = {
          eq: (_f: string, v: string) => {
            key += v;
            return chain;
          },
          then: (resolve: (r: unknown) => unknown) =>
            resolve(
              state.failSave
                ? { data: null, error: { message: "offline" } }
                : (state.receipts.set(key, {
                    ...state.receipts.get(key)!,
                    ...value,
                  }),
                  { data: null, error: null }),
            ),
        };
        return chain;
      },
      delete: () => {
        let key = "";
        const chain = {
          eq: (_f: string, v: string) => {
            key += v;
            return chain;
          },
          then: (resolve: (r: unknown) => unknown) =>
            resolve((state.receipts.delete(key), { data: null, error: null })),
        };
        return chain;
      },
    }),
  }),
}));
import { providerOnce } from "@/lib/jobs/provider-once";
import { AppError } from "@/lib/server/errors";
describe("billable provider replay protection", () => {
  beforeEach(() => {
    state.receipts.clear();
    state.failSave = false;
  });
  it("returns a saved response without a second paid call", async () => {
    const call = vi.fn(async () => ({ answer: "saved" }));
    expect(await providerOnce("job", "draft", call)).toEqual({
      answer: "saved",
    });
    expect(await providerOnce("job", "draft", call)).toEqual({
      answer: "saved",
    });
    expect(call).toHaveBeenCalledTimes(1);
  });
  it("does not replay a timeout with an uncertain provider outcome", async () => {
    const call = vi.fn(async () => {
      throw new Error("timeout");
    });
    await expect(providerOnce("job", "draft", call)).rejects.toThrow("timeout");
    await expect(providerOnce("job", "draft", call)).rejects.toThrow(
      "uncertain outcome",
    );
    expect(call).toHaveBeenCalledTimes(1);
  });
  it("blocks duplicate concurrent work before either response is saved", async () => {
    let finish!: (value: string) => void;
    const call = vi.fn(() => new Promise<string>((r) => (finish = r)));
    const one = providerOnce("job", "draft", call);
    await Promise.resolve();
    await expect(providerOnce("job", "draft", call)).rejects.toThrow(
      "uncertain outcome",
    );
    finish("done");
    expect(await one).toBe("done");
    expect(call).toHaveBeenCalledTimes(1);
  });
  it("does not replay when the provider succeeded but response persistence failed", async () => {
    state.failSave = true;
    const call = vi.fn(async () => ({ id: "provider-result" }));
    await expect(providerOnce("job", "draft", call)).rejects.toThrow();
    state.failSave = false;
    await expect(providerOnce("job", "draft", call)).rejects.toThrow(
      "uncertain outcome",
    );
    expect(call).toHaveBeenCalledTimes(1);
  });
  it.each(["provider_auth", "provider_rate_limit"])(
    "permits retry after a definite %s rejection",
    async (code) => {
      const call = vi
        .fn()
        .mockRejectedValueOnce(new AppError("rejected", 429, code))
        .mockResolvedValue({ id: "okay" });
      await expect(providerOnce("job", "draft", call)).rejects.toThrow(
        "rejected",
      );
      expect(await providerOnce("job", "draft", call)).toEqual({ id: "okay" });
      expect(call).toHaveBeenCalledTimes(2);
    },
  );
});
