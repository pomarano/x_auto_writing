# x-daily-introspection

**内省テック**向け X 投稿下書きの半自動生成リポジトリです。

- 毎朝 GitHub Actions が下書きを作成
- メールで投稿本文を通知（設定時）
- 確認・X への投稿は人間が実施

## ドキュメント

- セットアップ全体: `.company/secretary/automation/x-daily/CLOUD.md`
- GitHub に載せるファイル: `GITHUB-REPO.md`

## ローカルとの関係

このフォルダ（`blog_company`）には秘書室メモや記事ドラフトもありますが、  
**GitHub には自動化に必要なファイルだけ** が push されます（`.gitignore` で制御）。
