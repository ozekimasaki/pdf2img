import exifr from 'exifr';

export type OrientedCanvas = { canvas: HTMLCanvasElement; width: number; height: number };

// EXIFの回転を考慮しつつ、画像をCanvasに描画して返す
export async function fileToCanvas(file: File): Promise<OrientedCanvas> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const orientation = await getOrientationSafe(file);

    const { canvas, ctx } = createCanvasFor(img, orientation);
    drawWithOrientation(ctx, img, orientation);

    return { canvas, width: canvas.width, height: canvas.height };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

async function getOrientationSafe(file: File): Promise<number> {
  try {
    const o = await (exifr as any).orientation(file);
    return typeof o === 'number' ? o : 1;
  } catch {
    return 1;
  }
}

function createCanvasFor(img: HTMLImageElement, orientation: number) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // 回転（5-8は縦横反転）
  const rotate90 = orientation >= 5 && orientation <= 8;
  canvas.width = rotate90 ? h : w;
  canvas.height = rotate90 ? w : h;

  return { canvas, ctx };
}

function drawWithOrientation(ctx: CanvasRenderingContext2D, img: HTMLImageElement, orientation: number) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;

  switch (orientation) {
    case 2:
      ctx.translate(cw, 0); ctx.scale(-1, 1); break;
    case 3:
      ctx.translate(cw, ch); ctx.rotate(Math.PI); break;
    case 4:
      ctx.translate(0, ch); ctx.scale(1, -1); break;
    case 5:
      ctx.rotate(0.5 * Math.PI); ctx.scale(1, -1); break;
    case 6:
      ctx.rotate(0.5 * Math.PI); ctx.translate(0, -ch); break;
    case 7:
      ctx.rotate(0.5 * Math.PI); ctx.translate(cw, -ch); ctx.scale(-1, 1); break;
    case 8:
      ctx.rotate(-0.5 * Math.PI); ctx.translate(-cw, 0); break;
    default:
      // 1: 何もしない
      break;
  }
  // キャンバスいっぱいに描画（余白なし、アスペクト維持）
  let dw = cw, dh = ch;
  let dx = 0, dy = 0;
  const scale = Math.min(cw / w, ch / h);
  dw = w * scale; dh = h * scale;
  dx = (cw - dw) / 2; dy = (ch - dh) / 2;

  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, dx, dy, dw, dh);
}
