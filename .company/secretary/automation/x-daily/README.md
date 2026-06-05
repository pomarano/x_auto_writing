# X 下書き — 1日1回自動生成

**半自動:** 毎朝エージェントが `social/x-drafts/YYYY-MM-DD.md` を作成 → あなたが確認・X投稿。

## 初回セットアップ（5分）

### 1. Cursor API キーを取得

1. [Cursor Dashboard](https://cursor.com/dashboard) で API キーを発行
2. `.env` に設定:

```bash
cd /Users/ooguchi/Desktop/claude_company/blog_company/.company/secretary/automation/x-daily
cp .env.example .env
# .env を開き CURSOR_API_KEY= を記入
```

### 2. インストール

```bash
./install.sh
```

- Node.js + `@cursor/sdk` を入れる
- **毎日 7:00（日本時間）** に launchd で `run.sh` を実行

### 3. 動作確認（手動テスト）

今日の下書きがまだ無い日に:

```bash
./run.sh
cat ../../social/x-drafts/$(date +%Y-%m-%d).md
```

ログ: `logs/YYYY-MM-DD.log`

## 毎日のあなたの作業

1. `social/x-drafts/今日.md` を開く
2. 「投稿本文」を確認 → X にコピペ
3. 投稿後 `status: posted` に変更（任意）

## 時刻の変更

`~/Library/LaunchAgents/com.pomarano.x-daily-draft.plist` の `Hour` / `Minute` を編集後:

```bash
launchctl bootout gui/$(id -u)/com.pomarano.x-daily-draft
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.pomarano.x-daily-draft.plist
```

## 停止

```bash
launchctl bootout gui/$(id -u)/com.pomarano.x-daily-draft
```

## GitHub Actions（推奨）

Mac の launchd は **スリープ中動きません**。常時実行は GitHub Actions を使います。

ワークフロー: リポジトリ直下 `.github/workflows/x-daily-draft.yml`（毎日 22:00 UTC = 翌 07:00 JST）

### Secrets（Settings → Secrets and variables → Actions）

| 名前 | 必須 | 内容 |
|------|------|------|
| `CURSOR_API_KEY` | ○ | [Cursor Dashboard](https://cursor.com/dashboard) の **User API Key** |
| `NOTIFY_EMAIL` | △ | 通知先メールアドレス |
| `MAIL_USERNAME` | △ | Gmail 送信用 |
| `MAIL_APP_PASSWORD` | △ | Gmail アプリパスワード（16桁） |
| `RESEND_API_KEY` | △ | [Resend](https://resend.com) API キー（Resend 方式） |

### Variables

| 名前 | 値 | 説明 |
|------|-----|------|
| `X_DAILY_EMAIL_ENABLED` | `true` | メール通知を有効化 |
| `X_DAILY_EMAIL_PROVIDER` | `gmail` または `resend` | 省略時は Gmail |

### 動作確認

Actions タブ → **X Daily Draft** → **Run workflow**

下書きは `social/x-drafts/YYYY-MM-DD.md` にコミットされます。Mac の launchd は停止してよいです。

## 注意

- Mac がスリープ中は launchd は実行されない
- 同じ日の下書きが既にあると **スキップ**（二重生成しない）
- X への自動投稿はしない（仕様どおり）

## 関連

- 仕様: `../../notes/x-shuuchaku-agent-spec.md`
- 手動プロンプト: `../../notes/x-shuuchaku-agent-prompt.md`
