---
topic: Mac 以外で X 下書きを定期実行する
---

# Mac スリープ時の代替 — クラウド定期実行

Mac の launchd は **スリープ中は動かない** ため、常時起動のクラウドで回すのが確実です。

## おすすめ順

| 順 | 方式 | 費用目安 | 難易度 | 向いている人 |
|----|------|----------|--------|--------------|
| 1 | **GitHub Actions** | 無料枠内（私有リポでも月2,000分程度） | 低 | すでに GitHub を使う／使いたい |
| 2 | **VPS + cron** | 月数百円〜 | 中 | サーバー運用に慣れている |
| 3 | **Cursor Cloud Agent** | Cursor 利用料 | 中 | リポジトリ連携で長時間ジョブ |
| 4 | Raspberry Pi 等 | 初期費用のみ | 中 | 自宅に常時起動機器を置ける |

---

## 1. GitHub Actions（推奨）

### 仕組み（生成 + メール通知）

```
毎日 22:00 UTC（= 翌 07:00 JST）
  → GitHub のサーバーで run_daily.mjs 実行
  → social/x-drafts/YYYY-MM-DD.md を作成
  → 投稿本文をメールで通知（設定時）
  → リポジトリにコミット
  → あなたはメールを確認 → X に投稿
```

**自動実行とメール通知を両方やるなら GitHub Actions が最適**です（Mac スリープ不要・追加サーバー不要）。

ワークフロー: リポジトリ直下 `.github/workflows/x-daily-draft.yml`

### セットアップ手順

1. **必要なファイルだけ GitHub に push**（`gh` 不要・記事ドラフト等は含めない）

   **A. GitHub Web でリポジトリ作成**（https://github.com/new ）
   - 登録済み: https://github.com/pomarano/x_auto_writing

   **B. ローカルから push**
   ```bash
   cd /Users/ooguchi/Desktop/claude_company/blog_company
   git init
   git add .
   git status   # 登録対象の確認（GITHUB-REPO.md 参照）
   git commit -m "Add X daily draft automation"
   git branch -M main
   git remote add origin https://github.com/pomarano/x_auto_writing.git
   git push -u origin main
   ```

   登録ファイル一覧: リポジトリ直下 `GITHUB-REPO.md`

2. **Cursor API キーを発行**（下記「API キー発行手順」）→ GitHub Secrets に登録

   | 名前 | 必須 | 内容 |
   |------|------|------|
   | `CURSOR_API_KEY` | ○ | **User API Key**（Cloud Agents / SDK 用） |
   | `NOTIFY_EMAIL` | △ | 通知先メールアドレス |
   | `MAIL_USERNAME` | △ | Gmail 送信用（Gmail 方式） |
   | `MAIL_APP_PASSWORD` | △ | Gmail アプリパスワード（16桁） |
   | `RESEND_API_KEY` | △ | [Resend](https://resend.com) API キー（Resend 方式） |

3. **Variables を登録**（Settings → Secrets and variables → Actions → **Variables**）

   | 名前 | 値 | 説明 |
   |------|-----|------|
   | `X_DAILY_EMAIL_ENABLED` | `true` | メール通知を有効化 |
   | `X_DAILY_EMAIL_PROVIDER` | `gmail` または `resend` | 省略時は Gmail |
   | `NOTIFY_FROM` | （任意） | Resend の送信元。例: `内省テック <notify@yourdomain.com>` |

4. **手動テスト**
   - Actions タブ → 「X Daily Draft」→ **Run workflow**

5. **Mac の launchd は停止してよい**
   ```bash
   launchctl bootout gui/$(id -u)/com.pomarano.x-daily-draft
   ```

### メール通知の設定（Gmail 推奨）

1. Google アカウントで [2段階認証](https://myaccount.google.com/security) を有効化
2. [アプリパスワード](https://myaccount.google.com/apppasswords) を発行（「メール」「その他」）
3. Secrets に登録:
   - `MAIL_USERNAME` = あなたの Gmail アドレス
   - `MAIL_APP_PASSWORD` = 発行した16桁（スペースなし）
   - `NOTIFY_EMAIL` = 通知を受け取るアドレス（同じ Gmail で可）
4. Variables: `X_DAILY_EMAIL_ENABLED` = `true`

届くメールには **コピー用の投稿本文** がそのまま入ります。

### メールの別方式: Resend

API キー1つで済むが、本番送信にはドメイン認証が必要。  
Variables で `X_DAILY_EMAIL_PROVIDER` = `resend`、Secret に `RESEND_API_KEY` を設定。

### Cursor API キー発行手順

1. ブラウザで https://cursor.com/dashboard を開く（Cursor アカウントでログイン）
2. **API Keys**（ユーザ API キー）の画面を開く  
   - メニュー名は **Settings → API Keys** またはダッシュボードの **Integrations** 付近の場合あり  
   - 公式: [CLI Authentication](https://cursor.com/docs/cli/reference/authentication) — *Generate a user API key from Cursor Dashboard → API Keys*
3. **Create API Key**（新規作成）をクリック
4. 名前を付ける（例: `x_auto_writing-github-actions`）
5. 表示されたキーを **すぐにコピー**（二度と全文は表示されない）
6. GitHub → https://github.com/pomarano/x_auto_writing/settings/secrets/actions  
   → **New repository secret** → 名前 `CURSOR_API_KEY`、値に貼り付け

**注意（よくある間違い）**

| キーの種類 | 使える？ | 備考 |
|------------|----------|------|
| **User API Key**（API Keys で発行） | ○ | `CURSOR_API_KEY` に設定するのはこれ |
| Admin API Key（`crsr_...`、Teams 管理用） | **×** | SDK / 今回の自動化では未対応 |
| Service Account Key | △ | Enterprise プラン向け |

キーは他人に見せない・リポジトリにコミットしない（`.env` も Git 対象外）。

### 下書きの見方

- **メール**（設定済みの場合）
- GitHub 上で `social/x-drafts/YYYY-MM-DD.md` を開く
- Mac で `git pull`

### 注意

- `package-lock.json` が無いと `npm ci` が失敗する → 初回 push 前に `npm install` して lock をコミット
- `.env` は **コミットしない**（`.gitignore` 済み）。キーは GitHub Secrets のみ
- Actions の無料枠を超えると課金（1日1回・数分なら通常は余裕）

---

## 2. VPS + cron（常駐サーバー）

Oracle Cloud Always Free、さくら VPS、ConoHa など。

```bash
# サーバー上
git clone <your-repo>
cd blog_company/.company/secretary/automation/x-daily
cp .env.example .env   # CURSOR_API_KEY を記入
./install.sh           # launchd の代わりに crontab を使う版に書き換え可
```

crontab 例（7:00 JST）:

```
0 7 * * * TZ=Asia/Tokyo /path/to/blog_company/.company/secretary/automation/x-daily/run.sh
```

---

## 3. Cursor Cloud Agent

SDK の `cloud: { repos: [...] }` で Cursor 側 VM がリポジトリを clone して実行。  
GitHub Actions から cloud モードを呼ぶことも可能（長時間・PR 作成向き）。

今回の「1ファイル書いて終わり」には **Actions + local runtime** で十分。

---

## 4. その他

| サービス | 評価 |
|----------|------|
| Google Cloud Run + Scheduler | 可能だが設定量多め |
| Railway / Render Cron | 小規模ジョブ向き、有料プランが必要なことが多い |
| Vercel Cron | 実行時間制限が短く、エージェント向きではない |

---

## 通知手段の比較

| 手段 | 自動実行とセット | 難易度 | 備考 |
|------|------------------|--------|------|
| **GitHub Actions + Gmail** | ○ | 低 | 個人向け。上記セットアップ |
| **GitHub Actions + Resend** | ○ | 低〜中 | ドメイン認証後は本番向き |
| Slack / Discord Webhook | ○（ワークフロー追記） | 低 | メールより設定簡単なことも |
| Telegram Bot | ○ | 低 | スマホ通知向き。要 Bot トークン |
| Mac launchd + mail | △ | 中 | スリープで止まる |
| VPS + cron + sendmail | ○ | 高 | サーバー管理が必要 |

## 比較まとめ

**「毎日自動生成 + メール通知 + Mac スリープ無関係」→ GitHub Actions + Gmail がいちばん手軽。**

必要なもの:
- GitHub 私有リポジトリ
- Secrets: `CURSOR_API_KEY` + メール用2〜3個
- Variables: `X_DAILY_EMAIL_ENABLED=true`
