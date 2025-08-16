# Img2PDF (Vite + React + TS)

JPG/PNG/GIF/WebP を PDF に変換する静的Webツール（Cloudflare Pages想定）。

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

## 注意
- アニメーションGIF/WebPは先頭フレームを静止画として取り込みます。
- 大きな画像はブラウザメモリを消費します。大量変換時は段階的に実行してください。
