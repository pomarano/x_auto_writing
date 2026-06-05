#!/usr/bin/env node
/**
 * Extract X post body from draft markdown for email notification.
 * Writes email-subject.txt and email-body.txt next to this script.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function extractPostBody(markdown) {
  const m = markdown.match(
    /## 投稿本文（コピー用）\s*\n+([\s\S]*?)(?=\n## |\n*$)/
  );
  return m ? m[1].trim() : markdown.trim();
}

function extractMeta(markdown, key) {
  const m = markdown.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return m ? m[1].trim() : "";
}

const draftPath = process.argv[2];
if (!draftPath) {
  console.error("Usage: node extract_email.mjs <path-to-draft.md>");
  process.exit(1);
}

const markdown = readFileSync(draftPath, "utf8");
const date = extractMeta(markdown, "date") || "unknown";
const theme = extractMeta(markdown, "theme") || "";
const postBody = extractPostBody(markdown);
const charCount = [...postBody].length;

const subject = `[内省テック] X下書き ${date}${theme ? ` — ${theme}` : ""}`;

const body = `内省テック — X 投稿下書き（${date}）

━━━━━━━━━━━━━━━━━━━━
【コピー用・投稿本文】（${charCount}字）
━━━━━━━━━━━━━━━━━━━━

${postBody}

━━━━━━━━━━━━━━━━━━━━

■ あなたの作業
1. 内容を確認（必要なら手直し）
2. X にコピペして投稿
3. GitHub 上の draft ファイルの status を posted に変更（任意）

■ ファイル
${draftPath}

※ 自動生成です。投稿前に必ず確認してください。
`;

writeFileSync(join(__dirname, "email-subject.txt"), subject, "utf8");
writeFileSync(join(__dirname, "email-body.txt"), body, "utf8");

console.log(`Subject: ${subject}`);
console.log(`Body chars: ${body.length}`);
