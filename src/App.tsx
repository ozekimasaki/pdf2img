import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { createMergedPdf, createSinglePdf } from './utils/pdf';
import { i18n, getDefaultLang, type Lang } from './i18n';

const ACCEPT = '.jpg,.jpeg,.png,.gif,.webp,.avif,.bmp,.svg,.jfif,.ico';

type Item = {
  id: string;
  file: File;
  previewUrl: string;
};

type Mode = 'single' | 'merge';

function formatBytes(bytes: number) {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${sizes[i]}`;
}

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<Mode>('single');
  const [isBusy, setIsBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [lang, setLang] = useState<Lang>(getDefaultLang());
  const t = useMemo(() => i18n[lang], [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('lang', lang); } catch {}
    // Update document title per language
    try { document.title = `${i18n[lang].title} - ${i18n[lang].subtitle}`; } catch {}
  }, [lang]);

  const onFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const accepted = Array.from(files).filter((f) => /\.(jpe?g|png|gif|webp|avif|bmp|svg|jfif|ico)$/i.test(f.name));
    setItems((prev) => {
      const dedup = accepted.filter((f) => !prev.some((p) => p.file.name === f.name && p.file.lastModified === f.lastModified));
      const mapped: Item[] = dedup.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      return [...prev, ...mapped];
    });
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  }, [onFiles]);
 
  const remove = (id: string) => setItems((prev) => {
    const target = prev.find((x) => x.id === id);
    if (target) {
      try { URL.revokeObjectURL(target.previewUrl); } catch {}
    }
    return prev.filter((x) => x.id !== id);
  });
  const moveUp = (index: number) => index > 0 && setItems((prev) => {
    const next = prev.slice();
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    return next;
  });
  const moveDown = (index: number) => index < items.length - 1 && setItems((prev) => {
    const next = prev.slice();
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    return next;
  });

  const clearAll = () => {
    items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    setItems([]);
  };

  const disabled = isBusy || items.length === 0;

  const handleConvert = async () => {
    try {
      setIsBusy(true);
      if (mode === 'merge') {
        const bytes = await createMergedPdf(items.map((x) => x.file));
        const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
        saveAs(blob, 'merged.pdf');
      } else {
        // single: 1枚なら直DL、複数ならZIP
        if (items.length === 1) {
          const only = items[0];
          const bytes = await createSinglePdf(only.file);
          const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
          saveAs(blob, `${basename(only.file.name)}.pdf`);
        } else {
          const zip = new JSZip();
          for (const it of items) {
            const bytes = await createSinglePdf(it.file);
            zip.file(`${basename(it.file.name)}.pdf`, bytes);
          }
          const content = await zip.generateAsync({ type: 'blob' });
          saveAs(content, 'images-pdf.zip');
        }
      }
    } catch (e) {
      console.error(e);
      alert(t.error_message);
    } finally {
      setIsBusy(false);
    }
  };

  const onPick = () => inputRef.current?.click();

  return (
    <div className="app" aria-busy={isBusy}>
      <header className="header">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
        <div style={{ marginTop: 8 }}>
          <label>
            {t.language}: 
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              style={{ marginLeft: 6 }}
            >
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
            </select>
          </label>
        </div>
      </header>

      <main className="container">
        <section className="panel">
          <div className="mode">
            <label className={`mode-item ${mode === 'merge' ? 'active' : ''}`}>
              <input type="radio" name="mode" value="merge" checked={mode === 'merge'} onChange={() => setMode('merge')} />
              {t.mode_merge}
            </label>
            <label className={`mode-item ${mode === 'single' ? 'active' : ''}`}>
              <input type="radio" name="mode" value="single" checked={mode === 'single'} onChange={() => setMode('single')} />
              {t.mode_single}
            </label>
          </div>

          <div
            className="dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={onPick}
            role="button"
            aria-label={t.aria_add_images}
          >
            <input ref={inputRef} type="file" accept={ACCEPT} multiple onChange={(e) => onFiles(e.target.files)} hidden />
            <div className="dropzone-inner">
              <div className="icon">⬆️</div>
              <div className="text">
                {t.drop_prompt}
                <div className="sub">{t.drop_supported}</div>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <>
              <ul className="list">
                {items.map((it, i) => (
                  <li className="list-item" key={it.id}>
                    <img className="thumb" src={it.previewUrl} alt={it.file.name} />
                    <div className="meta">
                      <div className="name" title={it.file.name}>{it.file.name}</div>
                      <div className="sub">{formatBytes(it.file.size)}</div>
                    </div>
                    <div className="actions">
                      <button className="btn ghost" onClick={() => moveUp(i)} disabled={i === 0 || isBusy}>↑</button>
                      <button className="btn ghost" onClick={() => moveDown(i)} disabled={i === items.length - 1 || isBusy}>↓</button>
                      <button className="btn ghost danger" onClick={() => remove(it.id)} disabled={isBusy}>{t.btn_delete}</button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="toolbar">
                <button className="btn" onClick={handleConvert} disabled={disabled}>
                  {isBusy
                    ? t.converting
                    : mode === 'merge'
                      ? t.btn_convert_merge
                      : (items.length === 1 ? t.btn_convert_single_direct : t.btn_convert_single_zip)}
                </button>
                <button className="btn ghost" onClick={clearAll} disabled={isBusy}>{t.btn_clear}</button>
              </div>
            </>
          )}
        </section>

        <section className="tips">
          <h3>{t.tips_title}</h3>
          <ul>
            <li>{t.tip1}</li>
            <li>{t.tip2}</li>
            <li>{t.tip3}</li>
            <li>{t.tip4}</li>
          </ul>
        </section>
      </main>

      <footer className="footer">© {new Date().getFullYear()} Img2PDF</footer>
    </div>
  );
}

function basename(name: string) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(0, i) : name;
}
