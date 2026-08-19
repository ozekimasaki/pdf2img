# Img2pdf (Vite + React + TypeScript)

画像（JPG / PNG / GIF / WebP / AVIF / BMP / SVG / JFIF / ICO）を PDF に変換する静的 Web ツールです。すべての処理はブラウザ内で完結し、ファイルはサーバーに送信されません。Cloudflare Pages / Workers（Static Assets）へのデプロイを想定しています。

> リポジトリ名は `pdf2img` ですが、機能としては「画像 → PDF」への変換ツールです（アプリ名・パッケージ名は `img2pdf`）。

## 主な機能

- **単体変換**: 画像ごとに 1 つの PDF を作成します。1 枚のときは PDF を直接ダウンロードし、複数選択時は ZIP（`images-pdf.zip`）にまとめて保存します。
- **複数結合**: 複数の画像を 1 つの PDF（`merged.pdf`）に結合します。並び順がページ順になります。
- **ブラウザ内処理**: 変換はすべてクライアント側で実行され、画像はアップロードされません。
- **EXIF 回転対応**: EXIF の Orientation を考慮し、正しい向きで PDF 化します。
- **ドラッグ&ドロップ / クリック選択**: ドロップゾーンへのドラッグ&ドロップ、またはクリックによるファイル選択に対応。
- **並び替え・削除**: 追加した画像は ↑ / ↓ ボタンで並び替え、個別削除、一括クリアが可能です。
- **多言語 UI**: 日本語 / English / 中文 に対応（`?lang=ja|en|zh` のクエリ、`localStorage`、ブラウザ言語から判定）。

### 対応フォーマット

`.jpg` / `.jpeg` / `.png` / `.gif` / `.webp` / `.avif` / `.bmp` / `.svg` / `.jfif` / `.ico`

## 要件

- Node.js（`.prototools` で `node = "~23"` を指定）
- パッケージマネージャー: 本リポジトリには `pnpm-lock.yaml` が含まれます（pnpm 推奨）。`package.json` のスクリプトは npm / pnpm いずれでも実行できます。

## インストール

```bash
# pnpm を利用する場合
pnpm install

# npm を利用する場合
npm install
```

## 使い方（開発）

```bash
npm run dev
```

開発サーバー（Vite）が起動します。ブラウザで表示された URL を開き、画像をドラッグ&ドロップまたはクリックで追加して「PDFを作成」を実行します。

## 開発コマンド

`package.json` に定義されているスクリプトは以下のとおりです。

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | Vite 開発サーバーを起動 |
| `npm run build` | 型チェック（`tsc -b`）後、本番ビルド（`vite build`）を実行し `dist/` に出力 |
| `npm run preview` | ビルド済み成果物をローカルでプレビュー |
| `npm run deploy:cf` | `wrangler deploy --config wrangler.jsonc` で Cloudflare Workers にデプロイ |

型チェックのみを実行したい場合は `npx tsc --noEmit`（または `npx tsc -b`）を利用できます。なお、本リポジトリには Lint（ESLint 等）およびテストの設定・スクリプトは含まれていません。

## ビルド

```bash
npm run build
npm run preview
```

出力は `dist/` に生成されます。

## プロジェクト構成

```
.
├── index.html            # エントリ HTML（SEO 用メタタグ / 構造化データ / 解析タグを含む）
├── src/
│   ├── main.tsx          # React エントリポイント（#root へマウント）
│   ├── App.tsx           # メイン UI（ファイル選択・並び替え・変換の制御）
│   ├── i18n.ts           # 多言語文言と言語判定ロジック
│   ├── styles.css        # スタイル
│   ├── utils/
│   │   ├── pdf.ts        # pdf-lib による単体 / 結合 PDF 生成
│   │   └── exif.ts       # exifr による EXIF 回転を考慮した Canvas 描画
│   ├── shims/pako.ts     # pako を ESM から利用するためのシム
│   └── types/            # exifr / pako のアンビエント型宣言
├── public/               # 静的ファイル（robots.txt / sitemap.xml / ads.txt / og 画像）
├── vite.config.ts        # Vite 設定（React プラグイン / optimizeDeps 等）
├── tsconfig.json         # TypeScript 設定（strict 有効・noEmit）
├── wrangler.jsonc        # Cloudflare Workers（Static Assets）設定
└── package.json
```

主な依存関係:

- [pdf-lib](https://pdf-lib.js.org/) — PDF の生成・画像埋め込み
- [exifr](https://github.com/MikeKovarik/exifr) — EXIF Orientation の読み取り
- [jszip](https://stuk.github.io/jszip/) — 単体変換（複数枚）時の ZIP 生成
- [file-saver](https://github.com/eligrey/FileSaver.js) — ファイルの保存
- [react](https://react.dev/) / react-dom — UI

## デプロイ

### Cloudflare Pages

- Project: New Project → Framework preset: **Vite**
- Build command: `npm run build`
- Build output directory: `dist`

### Cloudflare Workers（Static Assets）

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
   # もしくは
   npm run deploy:cf
   ```

補足:

- ルートに `wrangler.jsonc` を配置済みです（`assets.directory = ./dist`、`not_found_handling = single-page-application`）。
- ローカル確認は `npx wrangler dev`（静的アセットの挙動を確認）。開発時は従来どおり `npm run dev`（Vite）も利用できます。

## 注意

- アニメーション GIF / WebP / AVIF は先頭フレームを静止画として取り込みます。
- 大きな画像はブラウザメモリを消費します。大量変換時は段階的に実行してください。
- SVG は外部参照（外部画像、フォント等）を含む場合、セキュリティ上の制約で Canvas が "tainted" 状態となり描画できないことがあります（同一オリジンで自己完結した SVG は問題ありません）。

## ライセンス

[MIT License](./LICENSE)
