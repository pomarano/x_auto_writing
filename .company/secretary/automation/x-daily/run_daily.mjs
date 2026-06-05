#!/usr/bin/env node
/**
 * Generate today's X draft via Cursor SDK (semi-auto pipeline).
 */
import { readFileSync, existsSync, appendFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Agent } from "@cursor/sdk";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../../../..");
const DRAFTS = join(ROOT, ".company/secretary/social/x-drafts");
const PROMPT_FILE = join(__dirname, "prompt.md");

function setOutput(name, value) {
  const out = process.env.GITHUB_OUTPUT;
  if (out) appendFileSync(out, `${name}=${value}\n`);
}

function todayJst() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function main() {
  const date = todayJst();
  const draftPath = join(DRAFTS, `${date}.md`);

  if (existsSync(draftPath)) {
    console.log(`SKIP: draft already exists: ${draftPath}`);
    setOutput("draft_created", "false");
    return 0;
  }

  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) {
    console.error("ERROR: CURSOR_API_KEY is not set.");
    console.error("Set it in .company/secretary/automation/x-daily/.env");
    return 1;
  }

  const basePrompt = readFileSync(PROMPT_FILE, "utf8");
  const prompt = `【自動実行】日本時間の今日は ${date} です。\n\n${basePrompt}\n\n必ず \`.company/secretary/social/x-drafts/${date}.md\` を新規作成してください。`;

  console.log(`START: generating draft for ${date}`);

  try {
    const result = await Agent.prompt(prompt, {
      apiKey,
      model: { id: "composer-2.5" },
      local: { cwd: ROOT },
    });

    console.log(`STATUS: ${result.status}`);
    if (result.result) {
      const text = String(result.result);
      console.log(text.slice(0, 2000) + (text.length > 2000 ? "..." : ""));
    }

    if (existsSync(draftPath)) {
      console.log(`OK: created ${draftPath}`);
      setOutput("draft_created", "true");
      return 0;
    }

    console.error(`WARN: agent finished but file not found: ${draftPath}`);
    return 2;
  } catch (err) {
    console.error("ERROR:", err.message ?? err);
    return 1;
  }
}

process.exit(await main());
