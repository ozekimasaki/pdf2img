# Img2PDF (Vite + React + TS)

JPG/PNG/GIF/WebP/AVIF/BMP/SVG/JFIF/ICO を PDF に変換する静的Webツール（Cloudflare Pages想定）。

- 単体変換: 画像ごとに1つのPDFを作成（複数選択時はZIPにまとめて保存）
- 複数結合: 複数画像を1つのPDFに結合
- すべてブラウザ内で処理（サーバー送信なし）
- EXIFの回転情報に対応（正しい向きでPDF化）

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
npm run preview
```

出力は `dist/` に生成されます。

## Cloudflare Pages
- Project: New Project → Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`

## Cloudflare Workers

以下の手順で Workers（Static Assets）にデプロイできます。

1. ログイン（初回のみ）
   ```bash
   npx wrangler login
   ```
2. ビルド
   ```bash
   npm run build
   ```
3. デプロイ
   ```bash
   npx wrangler deploy
   ```

補足:
- ルートに `wrangler.jsonc` を配置済み（`assets.directory=./dist`、`not_found_handling=single-page-application`）。
- ローカル確認は `npx wrangler dev`（静的アセットの挙動を確認）。開発時は従来どおり `npm run dev`（Vite）も利用可能です。

## 注意
- アニメーション GIF / WebP / AVIF は先頭フレームを静止画として取り込みます。
- 大きな画像はブラウザメモリを消費します。大量変換時は段階的に実行してください。
- SVG は外部参照（外部画像、フォント等）を含む場合、セキュリティ上の制約で Canvas が "tainted" 状態となり、描画できないことがあります（同一オリジンで自己完結したSVGは問題ありません）。
