export type Lang = 'en' | 'ja' | 'zh';

export const i18n: Record<Lang, {
  title: string;
  subtitle: string;
  mode_merge: string;
  mode_single: string;
  drop_prompt: string;
  drop_supported: string;
  aria_add_images: string;
  btn_delete: string;
  btn_clear: string;
  converting: string;
  btn_convert_merge: string;
  btn_convert_single_direct: string;
  btn_convert_single_zip: string;
  tips_title: string;
  tip1: string;
  tip2: string;
  tip3: string;
  tip4: string;
  error_message: string;
  language: string;
}> = {
  en: {
    title: 'Img2pdf',
    subtitle: 'Convert JPG / PNG / GIF / WebP / AVIF / BMP / SVG / JFIF / ICO to PDF (single or merge)',
    mode_merge: 'Merge',
    mode_single: 'Single',
    drop_prompt: 'Drag & drop here or click to select',
    drop_supported: 'Supported: JPG, PNG, GIF, WebP, AVIF, BMP, SVG, JFIF, ICO',
    aria_add_images: 'Add images',
    btn_delete: 'Delete',
    btn_clear: 'Clear',
    converting: 'Converting…',
    btn_convert_merge: 'Create PDF (merge)',
    btn_convert_single_direct: 'Create PDF (single)',
    btn_convert_single_zip: 'Create PDF (single → ZIP)',
    tips_title: 'Tips',
    tip1: 'Use ↑↓ to reorder (used as page order when merging).',
    tip2: 'EXIF orientation is respected to keep correct rotation.',
    tip3: 'GIF / WebP / AVIF (animated) are imported as still images (first frame).',
    tip4: 'All processing is done in your browser. Files are not uploaded.',
    error_message: 'An error occurred during conversion. Please try different images.',
    language: 'Language'
  },
  ja: {
    title: 'Img2pdf',
    subtitle: 'JPG / PNG / GIF / WebP / AVIF / BMP / SVG / JFIF / ICO を PDF に変換（単体・結合）',
    mode_merge: '複数結合',
    mode_single: '単体変換',
    drop_prompt: 'ここにドラッグ&ドロップ または クリックして選択',
    drop_supported: '対応: JPG, PNG, GIF, WebP, AVIF, BMP, SVG, JFIF, ICO',
    aria_add_images: '画像を追加',
    btn_delete: '削除',
    btn_clear: 'クリア',
    converting: '変換中…',
    btn_convert_merge: 'PDFを作成（結合）',
    btn_convert_single_direct: 'PDFを作成（単体）',
    btn_convert_single_zip: 'PDFを作成（単体→ZIP）',
    tips_title: 'Tips',
    tip1: '順序は ↑↓ ボタンで並び替えできます（結合時のページ順になります）。',
    tip2: 'EXIF の回転情報を考慮して正しい向きでPDF化します。',
    tip3: 'GIF / WebP / AVIF は静止画として取り込みます（アニメは先頭フレーム）。',
    tip4: '処理はすべてブラウザ内で完結し、ファイルはサーバーに送信されません。',
    error_message: '変換中にエラーが発生しました。別の画像でお試しください。',
    language: '言語'
  },
  zh: {
    title: 'Img2pdf',
    subtitle: '将 JPG / PNG / GIF / WebP / AVIF / BMP / SVG / JFIF / ICO 转换为 PDF（单个/合并）',
    mode_merge: '合并',
    mode_single: '单个转换',
    drop_prompt: '将文件拖放到此处或点击选择',
    drop_supported: '支持: JPG, PNG, GIF, WebP, AVIF, BMP, SVG, JFIF, ICO',
    aria_add_images: '添加图片',
    btn_delete: '删除',
    btn_clear: '清除',
    converting: '转换中…',
    btn_convert_merge: '生成 PDF（合并）',
    btn_convert_single_direct: '生成 PDF（单个）',
    btn_convert_single_zip: '生成 PDF（单个→ZIP）',
    tips_title: '提示',
    tip1: '使用 ↑↓ 调整顺序（用于合并时的页序）。',
    tip2: '考虑 EXIF 旋转信息以保持正确方向。',
    tip3: 'GIF / WebP / AVIF（动图）以静态图导入（首帧）。',
    tip4: '所有处理均在浏览器内完成，不会上传文件。',
    error_message: '转换过程中发生错误。请尝试其他图片。',
    language: '语言'
  },
};

export function getDefaultLang(): Lang {
  const stored = (typeof localStorage !== 'undefined') ? localStorage.getItem('lang') as Lang | null : null;
  if (stored && (stored === 'en' || stored === 'ja' || stored === 'zh')) return stored;
  // Fallback: detect from browser language
  const nav = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language.toLowerCase() : '';
  if (nav.startsWith('ja')) return 'ja';
  if (nav.startsWith('zh')) return 'zh';
  return 'en';
}
