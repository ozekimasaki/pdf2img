import { PDFDocument } from 'pdf-lib';
import { fileToCanvas } from './exif';

// 1ファイルを1ページPDFに
export async function createSinglePdf(file: File): Promise<ArrayBuffer> {
  const { canvas, width, height } = await fileToCanvas(file);
  const doc = await PDFDocument.create();
  const page = doc.addPage([width, height]);

  const mime = pickMimeFromFile(file);
  const bytes = await canvasToBytes(canvas, mime);
  const img = mime === 'image/jpeg' ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
  page.drawImage(img, { x: 0, y: 0, width, height });

  const u8 = await doc.save();
  // Return a plain ArrayBuffer (avoid ArrayBuffer | SharedArrayBuffer union from .slice())
  return u8ToArrayBuffer(u8);
}

// 複数画像を結合して1つのPDFに
export async function createMergedPdf(files: File[]): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (const f of files) {
    const { canvas, width, height } = await fileToCanvas(f);
    const mime = pickMimeFromFile(f);
    const bytes = await canvasToBytes(canvas, mime);
    const img = mime === 'image/jpeg' ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
    const page = doc.addPage([width, height]);
    page.drawImage(img, { x: 0, y: 0, width, height });
  }
  const u8 = await doc.save();
  return u8ToArrayBuffer(u8);
}

function pickMimeFromFile(file: File): 'image/png' | 'image/jpeg' {
  // Use JPEG for JPEG/JFIF sources; otherwise PNG (keeps transparency when present)
  return /jpe?g$/i.test(file.type) || /\.(jpe?g|jfif)$/i.test(file.name) ? 'image/jpeg' : 'image/png';
}

async function canvasToBytes(canvas: HTMLCanvasElement, mime: 'image/png' | 'image/jpeg'): Promise<Uint8Array> {
  const quality = mime === 'image/jpeg' ? 0.9 : 0.95;
  const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), mime, quality));
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

function u8ToArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(u8.byteLength);
  new Uint8Array(buf).set(u8);
  return buf;
}
