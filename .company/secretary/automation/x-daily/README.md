# X 下書き — 1日1回自動生成

**半自動:** 毎朝 GitHub Actions が `social/x-drafts/YYYY-MM-DD.md` を作成 → あなたが確認・X投稿。

## セットアップ（GitHub Actions）

ワークフロー: リポジトリ直下 `.github/workflows/x-daily-draft.yml`（毎日 22:00 UTC = 翌 07:00 JST）

### 1. リポジトリに push

自動化用ファイルを GitHub に push します（`.gitignore` で対象ファイルのみ登録）。

### 2. Secrets（Settings → Secrets and variables → Actions）

| 名前 | 必須 | 内容 |
|------|------|------|
| `CURSOR_API_KEY` | ○ | [Cursor Dashboard](https://cursor.com/dashboard) の **User API Key** |
| `NOTIFY_EMAIL` | △ | 通知先メールアドレス |
| `MAIL_USERNAME` | △ | Gmail 送信用 |
| `MAIL_APP_PASSWORD` | △ | Gmail アプリパスワード（16桁） |
| `RESEND_API_KEY` | △ | [Resend](https://resend.com) API キー（Resend 方式） |

### 3. Variables

| 名前 | 値 | 説明 |
|------|-----|------|
| `X_DAILY_EMAIL_ENABLED` | `true` | メール通知を有効化 |
| `X_DAILY_EMAIL_PROVIDER` | `gmail` または `resend` | 省略時は Gmail |

### 4. 動作確認

Actions タブ → **X Daily Draft** → **Run workflow**

下書きは `social/x-drafts/YYYY-MM-DD.md` にコミットされます。メール通知を有効にしている場合、投稿本文が届きます。

## 毎日のあなたの作業

1. メールまたは GitHub 上で `social/x-drafts/今日.md` を開く
2. 「投稿本文」を確認 → X にコピペ
3. 投稿後 `status: posted` に変更（任意）

## 注意

- 同じ日の下書きが既にあると **スキップ**（二重生成しない）
- X への自動投稿はしない（仕様どおり）
- `CURSOR_API_KEY` は Secrets のみ。リポジトリにコミットしない

## 関連

- 仕様: `../../notes/x-shuuchaku-agent-spec.md`
- 手動プロンプト: `../../notes/x-shuuchaku-agent-prompt.md`
