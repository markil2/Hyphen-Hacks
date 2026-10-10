import crypto from "node:crypto";
import { Resend } from "resend";
import { config } from "./config";

export const createRawToken = () => crypto.randomBytes(32).toString("hex");
export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export async function sendEmail(input: { to: string; subject: string; text: string }) {
  if (config.EMAIL_PROVIDER === "console") {
    if (config.NODE_ENV !== "test") console.log(`Development email queued for ${input.to}: ${input.subject}`);
    return { provider: "console", id: null };
  }
  if (!config.RESEND_API_KEY) throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER=resend");
  const resend = new Resend(config.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({ from: config.EMAIL_FROM, to: input.to, subject: input.subject, text: input.text });
  if (error) throw new Error(`Email delivery failed: ${error.message}`);
  return { provider: "resend", id: data?.id ?? null };
}
