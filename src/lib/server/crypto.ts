import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import { required, AppError } from "./errors";
export const randomToken = () => randomBytes(32).toString("base64url");
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export function encrypt(value: unknown) {
  const key = Buffer.from(required("TOKEN_ENCRYPTION_KEY"), "base64");
  if (key.length !== 32)
    throw new AppError("Token encryption is not configured correctly.", 503);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return [
    "v1",
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    data.toString("base64"),
  ].join(".");
}
export function decrypt<T>(value: string): T {
  const [version, iv, tag, data] = value.split(".");
  if (version !== "v1") throw new Error("Invalid encrypted token version");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    Buffer.from(required("TOKEN_ENCRYPTION_KEY"), "base64"),
    Buffer.from(iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return JSON.parse(
    Buffer.concat([
      decipher.update(Buffer.from(data, "base64")),
      decipher.final(),
    ]).toString("utf8"),
  );
}
export function verifyHmac(
  body: string,
  header: string | null,
  secret: string,
) {
  if (!header) return false;
  const expected = createHmac("sha256", secret).update(body).digest();
  const actual = Buffer.from(header.replace(/^sha256=/, ""), "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
