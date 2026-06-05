---
topic: GitHub に登録するファイル（最小構成）
purpose: X 下書きの自動生成 + メール通知（GitHub Actions）
---

# GitHub 登録ファイル一覧

このリポジトリは **X 下書きの半自動パイプライン専用** です。  
記事ドラフト・AdSense メモ・秘書室のその他ファイルは **GitHub に載せません**（ローカルのみ）。

## 登録されるもの

| パス | 役割 |
|------|------|
| `.github/workflows/x-daily-draft.yml` | 毎日実行 + メール |
| `.company/secretary/automation/x-daily/*` | スクリプト・プロンプト（下記表） |
| `.company/secretary/notes/x-shuuchaku-agent-spec.md` | エージェント仕様 |
| `.company/secretary/social/x-drafts/*.md` | 生成された X 下書き |
| `README.md` / `GITHUB-REPO.md` / `.gitignore` | 説明・除外設定 |

### automation/x-daily に含まれるファイル

| ファイル | GitHub |
|----------|--------|
| `package.json` / `package-lock.json` | ○ |
| `prompt.md` | ○ |
| `run_daily.mjs` | ○ |
| `extract_email.mjs` / `send_resend.mjs` | ○ |
| `README.md` / `CLOUD.md` / `.env.example` | ○ |
| `node_modules/` | **×** |
| `.env` | **×**（Secrets で管理） |
| `logs/` | **×** |
| `install.sh` / `run.sh` / `*.plist` | **×**（Mac ローカル用） |

## 登録されないもの（ローカルのみ）

- `.company/secretary/notes/` のその他（記事ドラフト、AdSense、プライバシー原稿など）
- `.company/secretary/todos/` / `inbox/`
- `.company/CLAUDE.md` など

## 初回 push 手順

```bash
cd /Users/ooguchi/Desktop/claude_company/blog_company
git init
git add .
git status   # ← 上記「登録されるもの」だけが緑になっているか確認
git commit -m "Add X daily draft automation (minimal repo)"
gh repo create x-daily-introspection --private --source=. --push
```

`git status` で記事ドラフトなどが出てきたら `.gitignore` を見直してください。

## Secrets / Variables

`CLOUD.md` の「セットアップ手順」を参照。
