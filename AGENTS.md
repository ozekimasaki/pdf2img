# AGENTS.md

このリポジトリでコーディングエージェントが作業するためのガイドです。人間向けの概要は [README.md](./README.md) を参照してください。

## プロジェクト概要

画像（JPG / PNG / GIF / WebP / AVIF / BMP / SVG / JFIF / ICO）を PDF に変換する、フロントエンド完結型の静的 Web アプリです。すべての変換処理はブラウザ内で実行され、サーバー送信は行いません。技術スタックは **Vite + React 18 + TypeScript**、デプロイ先は Cloudflare Pages / Workers（Static Assets）を想定しています。

> リポジトリ名は `pdf2img` ですが、実装は「画像 → PDF」変換です。`package.json` の `name` は `img2pdf` です。

## プロジェクト構成 / エントリポイント

- `index.html` — Vite のエントリ HTML。SEO 用メタタグ、`application/ld+json` 構造化データ、解析タグ（AdSense / gtag）を含む。`<script type="module" src="/src/main.tsx">` から起動。
- `src/main.tsx` — React エントリポイント。`#root` に `<App />` をマウント。
- `src/App.tsx` — メイン UI。ファイル選択・ドラッグ&ドロップ・並び替え・削除・変換モード（`single` / `merge`）の制御。
- `src/utils/pdf.ts` — `pdf-lib` を用いた PDF 生成。`createSinglePdf(file)` と `createMergedPdf(files)` をエクスポート。
- `src/utils/exif.ts` — `exifr` で EXIF Orientation を読み取り、回転を考慮して Canvas に描画。`fileToCanvas(file)` をエクスポート。
- `src/i18n.ts` — 多言語文言（ja / en / zh）と `getDefaultLang()`（クエリ `?lang=` → `localStorage` → ブラウザ言語 の順で判定）。
- `src/styles.css` — スタイル。
- `src/shims/pako.ts` — `pako` を ESM から default import 可能にするシム。
- `src/types/exifr.d.ts`, `src/types/pako.d.ts` — アンビエント型宣言。
- `public/` — そのまま配信される静的ファイル（`robots.txt` / `sitemap.xml` / `ads.txt` / OG 画像）。
- 設定ファイル: `vite.config.ts`, `tsconfig.json`, `wrangler.jsonc`, `.prototools`。

## セットアップ

- Node.js は `.prototools` で `node = "~23"` を指定。
- パッケージマネージャーは **pnpm**（`pnpm-lock.yaml` が存在）。npm でも `package.json` のスクリプトは実行可能。

```bash
pnpm install   # もしくは npm install
```

## ビルド / テスト / Lint / 型チェックのコマンド

`package.json` に定義された実在のスクリプトのみを使用すること。

| 目的 | コマンド |
| --- | --- |
| 開発サーバー | `npm run dev` |
| ビルド（型チェック + 本番ビルド） | `npm run build`（`tsc -b && vite build`） |
| プレビュー | `npm run preview` |
| Cloudflare Workers デプロイ | `npm run deploy:cf`（`wrangler deploy --config wrangler.jsonc`） |
| 型チェックのみ | `npx tsc --noEmit`（または `npx tsc -b`） |

- **Lint**: ESLint など Lint の設定・スクリプトは存在しない。
- **テスト**: テストフレームワーク・テストスクリプトは存在しない。テストを追加する場合はまず方針を確認すること。
- 変更後は最低限 `npm run build`（型チェックを含む）が通ることを確認する。

## コーディング規約

- TypeScript は `strict` 有効。加えて `tsconfig.json` で `noUnusedLocals` / `noUnusedParameters` / `noFallthroughCasesInSwitch` が有効なため、未使用の変数・引数を残さない。
- `noEmit: true`（型チェックのみ。出力は Vite が担当）。`module`/`moduleResolution` は `ESNext`/`bundler`、`jsx` は `react-jsx`。
- ES Modules を使用（`package.json` の `"type": "module"`）。
- React は関数コンポーネント + Hooks。既存の `App.tsx` のスタイル（`useState` / `useCallback` / `useMemo` / `useRef`）に倣う。
- インデントは 2 スペース、文字列はシングルクォート、セミコロンあり（既存コードに合わせる）。
- UI 文言はハードコードせず `src/i18n.ts` に追加し、3 言語（ja / en / zh）すべてのキーを埋める。型定義（`i18n` のオブジェクト型）と各言語のキーを一致させること。
- 対応拡張子はコード内の複数箇所（`App.tsx` の `ACCEPT` と正規表現、`i18n.ts` の文言、`README.md`）に現れるため、追加・変更時は整合させる。

## 注意点

- **ブラウザ専用 API**: `document` / `Canvas` / `URL.createObjectURL` / `localStorage` / `navigator` などブラウザ API に依存する。Node 環境では動作しない前提。
- **メモリ / リソース管理**: `URL.createObjectURL` で作成した Blob URL は不要になったら `revokeObjectURL` すること（既存コードは削除・クリア・変換完了時に解放している）。
- **EXIF / 向き**: 画像の向きは `src/utils/exif.ts` の Orientation 処理に依存。回転ロジックを変更する際は 1〜8 の全ケースを確認する。
- **アニメーション画像**: GIF / WebP / AVIF は先頭フレームのみ静止画として取り込む。
- **SVG の tainted canvas**: 外部参照を含む SVG は Canvas が汚染され描画に失敗しうる。
- **PDF 出力形式**: `pdf.ts` は JPEG/JFIF を JPEG、その他を PNG として埋め込む（透過保持のため）。
- **デザイン非干渉**: UI/UX（レイアウト・色・フォント）は指示なく変更しない。
- **バージョン固定**: 依存ライブラリのバージョンを無断で変更しない。
- **デプロイ設定**: `wrangler.jsonc` は `assets.directory = ./dist`、`not_found_handling = single-page-application`。ビルド出力先 `dist/` を前提とする。
- コミットメッセージは日本語・Conventional Commits 形式（例: `docs: ...`, `feat(component): ...`）を用いる（`.windsurf/rules/global-gpt5.md` 準拠）。
