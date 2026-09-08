import "server-only";
import { lookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import ipaddr from "ipaddr.js";
import robotsParser from "robots-parser";
import { AppError } from "../server/errors";
export function isPublicAddress(address: string) {
  try {
    const parsed = ipaddr.process(address);
    return parsed.range() === "unicast";
  } catch {
    return false;
  }
}
export function normalizePublicUrl(input: string) {
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  } catch {
    throw new AppError("Enter a valid public website URL.");
  }
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.port && !["80", "443"].includes(url.port))
  )
    throw new AppError(
      "Use a public HTTP or HTTPS URL without credentials or custom ports.",
    );
  const host = url.hostname
    .toLowerCase()
    .replace(/\.$/, "")
    .replace(/^\[|\]$/g, "");
  if (
    !host ||
    host === "localhost" ||
    /\.(localhost|local|internal|test|invalid)$/.test(host) ||
    (!host.includes(".") && !host.includes(":"))
  )
    throw new AppError("Private and local addresses cannot be scanned.");
  if (ipaddr.isValid(host) && !isPublicAddress(host))
    throw new AppError("Private and reserved IP addresses cannot be scanned.");
  url.hash = "";
  return url;
}
export async function validatePublicUrl(input: string) {
  const url = normalizePublicUrl(input);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const addresses = await Promise.race([
    lookup(url.hostname.replace(/^\[|\]$/g, ""), { all: true }),
    new Promise<never>((_, reject) => {
      timer = setTimeout(
        () =>
          reject(
            new AppError(
              "The website address could not be resolved in time.",
              422,
            ),
          ),
        4000,
      );
    }),
  ]).finally(() => clearTimeout(timer));
  if (!addresses.length || addresses.some((a) => !isPublicAddress(a.address)))
    throw new AppError(
      "This address does not resolve exclusively to a public network.",
    );
  return { url, addresses };
}
export type SafeResponse = {
  url: string;
  status: number;
  headers: Record<string, string>;
  text: string;
  truncated: boolean;
};
export async function safeFetch(
  input: string,
  {
    maxBytes = 1_500_000,
    timeout = 12_000,
  }: { maxBytes?: number; timeout?: number } = {},
): Promise<SafeResponse> {
  let target = input;
  const deadline = Date.now() + timeout;
  for (let redirects = 0; redirects <= 4; redirects++) {
    const { url, addresses } = await validatePublicUrl(target);
    const remaining = deadline - Date.now();
    if (remaining <= 0)
      throw new AppError("The website took too long to respond.", 422);
    const result = await new Promise<SafeResponse>((resolve, reject) => {
      const transport = url.protocol === "https:" ? https : http;
      const req = transport.request(
        url,
        {
          method: "GET",
          agent: false,
          headers: {
            "User-Agent":
              "RankSushiBot/1.0 (+https://ranksushi.com/methodology)",
            Accept: "text/html,application/xhtml+xml,text/plain;q=0.8",
            "Accept-Encoding": "identity",
          },
          lookup: (_host, options, callback) => {
            if (options.all) callback(null, addresses);
            else callback(null, addresses[0].address, addresses[0].family);
          },
        },
        (res) => {
          const headers = Object.fromEntries(
            Object.entries(res.headers).map(([k, v]) => [
              k,
              Array.isArray(v) ? v.join(", ") : v || "",
            ]),
          );
          if ([301, 302, 303, 307, 308].includes(res.statusCode || 0)) {
            res.resume();
            resolve({
              url: url.href,
              status: res.statusCode!,
              headers,
              text: "",
              truncated: false,
            });
            return;
          }
          const chunks: Buffer[] = [];
          let received = 0;
          let ended = false;
          const finish = (truncated: boolean) => {
            if (ended) return;
            ended = true;
            resolve({
              url: url.href,
              status: res.statusCode || 0,
              headers,
              text: Buffer.concat(chunks).toString("utf8"),
              truncated,
            });
          };
          res.on("data", (chunk: Buffer) => {
            const left = maxBytes - received;
            if (chunk.length > left) {
              chunks.push(chunk.subarray(0, left));
              received += left;
              finish(true);
              res.destroy();
              return;
            }
            chunks.push(chunk);
            received += chunk.length;
          });
          res.on("end", () => finish(false));
          res.on("error", reject);
        },
      );
      const timer = setTimeout(
        () => req.destroy(new Error("Website timeout")),
        remaining,
      );
      req.on("close", () => clearTimeout(timer));
      req.on("error", () =>
        reject(
          new AppError(
            "The website could not be reached within the scan time limit.",
            422,
          ),
        ),
      );
      req.end();
    });
    if ([301, 302, 303, 307, 308].includes(result.status)) {
      if (!result.headers.location)
        throw new AppError("The website returned an incomplete redirect.", 422);
      target = new URL(result.headers.location, result.url).href;
      continue;
    }
    return result;
  }
  throw new AppError("The website redirected too many times.", 422);
}
export async function fetchPublicPage(input: string) {
  const url = normalizePublicUrl(input);
  try {
    const robots = await safeFetch(new URL("/robots.txt", url).href, {
      maxBytes: 150_000,
      timeout: 5000,
    });
    if (
      robots.status >= 200 &&
      robots.status < 300 &&
      robotsParser(new URL("/robots.txt", url).href, robots.text).isAllowed(
        url.href,
        "RankSushiBot",
      ) === false
    )
      throw new AppError(
        "This page is blocked for RankSushiBot by robots.txt.",
        422,
        "robots_blocked",
      );
  } catch (e) {
    if (e instanceof AppError && e.code === "robots_blocked") throw e;
  }
  const response = await safeFetch(url.href);
  if (
    response.headers["content-type"] &&
    !/html|xhtml/i.test(response.headers["content-type"])
  )
    throw new AppError("That URL does not return an HTML page.", 422);
  return response;
}
