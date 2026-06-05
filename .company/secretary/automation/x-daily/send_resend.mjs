#!/usr/bin/env node
/**
 * Send notification email via Resend API (optional alternative to Gmail SMTP).
 * Requires: RESEND_API_KEY, NOTIFY_EMAIL
 * Optional: NOTIFY_FROM (default: onboarding@resend.dev — Resend テスト用、自分宛のみ)
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) {
    console.log("SKIP: RESEND_API_KEY or NOTIFY_EMAIL not set");
    return 0;
  }

  const from =
    process.env.NOTIFY_FROM || "X下書き <onboarding@resend.dev>";
  const subject = readFileSync(join(__dirname, "email-subject.txt"), "utf8");
  const text = readFileSync(join(__dirname, "email-body.txt"), "utf8");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", res.status, err);
    return 1;
  }

  console.log("OK: email sent via Resend to", to);
  return 0;
}

process.exit(await main());
