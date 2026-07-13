"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Move, RotateCcw, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  clampPan,
  getFrameSize,
  getInitialTransform,
  getPreviewAspectClass,
  isAnimatedImageType,
  loadImageElement,
  objectPositionFromTransform,
  parseObjectPosition,
  renderFocusedImageFile,
  shouldKeepOriginalUpload,
  transformFromObjectPosition,
  type ImageFrameRatio,
  type ImageTransform,
} from "@/lib/images/image-focus";

export type ImageUploadMeta = {
  objectPosition: string;
  keepOriginal?: boolean;
};

type ImagePositionEditorProps = {
  source: File | string;
  sourceName: string;
  sourceType: string;
  aspectRatio: ImageFrameRatio;
  allowKeepOriginal?: boolean;
  initialObjectPosition?: string | null;
  onCancel: () => void;
  onConfirm: (file: File, meta: ImageUploadMeta) => void;
  onConfirmOriginal: (file: File, meta: ImageUploadMeta) => void;
  onPositionOnly?: (meta: ImageUploadMeta) => void;
};

const HERO_FOCUS_PRESETS = [
  { label: "Teste in alto", value: "50% 18%" },
  { label: "Parte alta", value: "50% 30%" },
  { label: "Centro", value: "50% 50%" },
  { label: "Parte bassa", value: "50% 70%" },
];

export function ImagePositionEditor({
  source,
  sourceName,
  sourceType,
  aspectRatio,
  allowKeepOriginal,
  initialObjectPosition,
  onCancel,
  onConfirm,
  onConfirmOriginal,
  onPositionOnly,
}: ImagePositionEditorProps) {
  const frame = getFrameSize(aspectRatio);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const originalTransformRef = useRef<ImageTransform | null>(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [transform, setTransform] = useState<ImageTransform>({ panX: 0, panY: 0, scale: 1 });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewScale, setViewScale] = useState(1);

  useEffect(() => {
    function updateScale() {
      if (!viewportRef.current) return;
      setViewScale(viewportRef.current.clientWidth / frame.width);
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [frame.width]);

  const isAnimated = isAnimatedImageType(sourceType, sourceName);
  const keepOriginalUpload = shouldKeepOriginalUpload(
    allowKeepOriginal,
    sourceType,
    sourceName,
    source instanceof File
  );
  const useOriginalOnConfirm = Boolean(allowKeepOriginal && source instanceof File);
  const preferPng = sourceType === "image/png";

  useEffect(() => {
    let active = true;
    setLoading(true);

    loadImageElement(source)
      .then((img) => {
        if (!active) return;
        setImage(img);
        const original = getInitialTransform(frame.width, frame.height, img.width, img.height);
        originalTransformRef.current = original;
        const initial = initialObjectPosition
          ? transformFromObjectPosition(frame.width, frame.height, img.width, img.height, initialObjectPosition)
          : original;
        setTransform(initial);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [source, frame.width, frame.height, initialObjectPosition]);

  const updatePreview = useCallback(async () => {
    if (!image || useOriginalOnConfirm) return;
    const url = await renderFocusedPreviewDataUrlInternal(image, frame.width, frame.height, transform, preferPng);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }, [image, frame.width, frame.height, transform, preferPng, useOriginalOnConfirm]);

  useEffect(() => {
    if (!image) return;
    updatePreview();
  }, [image, transform, updatePreview]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function applyTransform(next: ImageTransform) {
    if (!image) return;
    const clamped = clampPan(
      next.panX,
      next.panY,
      frame.width,
      frame.height,
      image.width,
      image.height,
      next.scale
    );
    setTransform({ panX: clamped.panX, panY: clamped.panY, scale: next.scale });
  }

  function handlePointerDown(clientX: number, clientY: number) {
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      panX: transform.panX,
      panY: transform.panY,
    };
  }

  function handlePointerMove(clientX: number, clientY: number) {
    if (!dragRef.current || !image || !viewportRef.current) return;
    const scaleFactor = frame.width / viewportRef.current.clientWidth;
    const dx = (clientX - dragRef.current.startX) * scaleFactor;
    const dy = (clientY - dragRef.current.startY) * scaleFactor;
    applyTransform({
      panX: dragRef.current.panX + dx,
      panY: dragRef.current.panY + dy,
      scale: transform.scale,
    });
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function handleScaleChange(value: number) {
    if (!image) return;
    const coverScale = Math.max(frame.width / image.width, frame.height / image.height);
    const oldDrawW = image.width * coverScale * transform.scale;
    const oldDrawH = image.height * coverScale * transform.scale;
    const centerX = transform.panX + oldDrawW / 2;
    const centerY = transform.panY + oldDrawH / 2;
    const newDrawW = image.width * coverScale * value;
    const newDrawH = image.height * coverScale * value;
    applyTransform({
      panX: centerX - newDrawW / 2,
      panY: centerY - newDrawH / 2,
      scale: value,
    });
  }

  function applyFocusPoint(x: number, y: number) {
    if (!image) return;
    const next = transformFromObjectPosition(
      frame.width,
      frame.height,
      image.width,
      image.height,
      Math.round(x) + "% " + Math.round(y) + "%"
    );
    setTransform(next);
  }

  function applyFocusPreset(value: string) {
    if (!image) return;
    const next = transformFromObjectPosition(
      frame.width,
      frame.height,
      image.width,
      image.height,
      value
    );
    setTransform(next);
  }

  function handleResetOriginal() {
    if (!originalTransformRef.current) return;
    setTransform({
      panX: originalTransformRef.current.panX,
      panY: originalTransformRef.current.panY,
      scale: originalTransformRef.current.scale,
    });
  }

  async function handlePrimaryConfirm() {
    if (useOriginalOnConfirm) {
      await handleConfirmOriginal();
      return;
    }
    await handleConfirmCrop();
  }

  async function handleConfirmCrop() {
    if (!image) return;
    setSaving(true);
    try {
      const file = await renderFocusedImageFile(
        image,
        frame.width,
        frame.height,
        transform,
        sourceName,
        preferPng
      );
      const meta: ImageUploadMeta = {
        objectPosition: objectPositionFromTransform(
          transform,
          frame.width,
          frame.height,
          image.width,
          image.height
        ),
        keepOriginal: false,
      };
      onConfirm(file, meta);
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmOriginal() {
    if (!(source instanceof File) || !image) return;
    setSaving(true);
    try {
      const meta: ImageUploadMeta = {
        objectPosition: objectPositionFromTransform(
          transform,
          frame.width,
          frame.height,
          image.width,
          image.height
        ),
        keepOriginal: true,
      };
      onConfirmOriginal(source, meta);
    } finally {
      setSaving(false);
    }
  }

  async function handlePositionOnly() {
    if (!image || !onPositionOnly) return;
    setSaving(true);
    try {
      onPositionOnly({
        objectPosition: objectPositionFromTransform(
          transform,
          frame.width,
          frame.height,
          image.width,
          image.height
        ),
        keepOriginal: true,
      });
    } finally {
      setSaving(false);
    }
  }

  const isExistingSource = typeof source === "string";
  const livePreviewPosition = image
    ? objectPositionFromTransform(
        transform,
        frame.width,
        frame.height,
        image.width,
        image.height
      )
    : "50% 50%";
  const coverScale = image
    ? Math.max(frame.width / image.width, frame.height / image.height) * transform.scale
    : 1;
  const drawW = image ? image.width * coverScale : 0;
  const drawH = image ? image.height * coverScale : 0;
  const aspectClass = getPreviewAspectClass(aspectRatio);
  const isHeroMode = aspectRatio === "hero";
  const focusPoint = image
    ? parseObjectPosition(
        objectPositionFromTransform(
          transform,
          frame.width,
          frame.height,
          image.width,
          image.height
        )
      )
    : { x: 50, y: 50 };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-ink-900 p-5 shadow-2xl">
        <h3 className="text-lg font-semibold text-white">
          {isHeroMode ? "Posiziona background hero" : "Posiziona immagine"}
        </h3>
        <p className="mt-1 text-sm text-ink-400">
          {isHeroMode
            ? "Regola il punto focale per evitare tagli indesiderati. Valori verticali bassi mostrano la parte alta della foto."
            : "Trascina per spostare e usa lo zoom. L anteprima mostra il risultato finale."}
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink-400">
              <Move className="h-3.5 w-3.5" />
              Editor
            </p>
            <div
              ref={viewportRef}
              className={
                "relative w-full overflow-hidden rounded-xl border border-ink-600 bg-ink-950 " +
                aspectClass
              }
              onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
              onMouseMove={(e) => {
                if (e.buttons === 1) handlePointerMove(e.clientX, e.clientY);
              }}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                if (touch) handlePointerDown(touch.clientX, touch.clientY);
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                if (touch) handlePointerMove(touch.clientX, touch.clientY);
              }}
              onTouchEnd={handlePointerUp}
            >
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-ink-400">
                  Caricamento...
                </div>
              )}
              {image && (
                <img
                  src={image.src}
                  alt=""
                  draggable={false}
                  className="absolute max-w-none select-none"
                  style={{
                    width: drawW * viewScale + "px",
                    height: drawH * viewScale + "px",
                    left: transform.panX * viewScale + "px",
                    top: transform.panY * viewScale + "px",
                  }}
                />
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">
              {isHeroMode ? "Anteprima desktop hero" : "Anteprima"}
            </p>
            <div
              className={
                "overflow-hidden rounded-xl border border-brand-500/40 bg-white " + aspectClass
              }
            >
              {previewUrl || (useOriginalOnConfirm && image) ? (
                useOriginalOnConfirm && image ? (
                  <img
                    src={image.src}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: livePreviewPosition }}
                  />
                ) : (
                  <img src={previewUrl || ""} alt="" className="h-full w-full object-cover" />
                )
              ) : (
                <div className="flex h-full min-h-[120px] items-center justify-center text-sm text-ink-400">
                  Anteprima...
                </div>
              )}
            </div>
            {isHeroMode && image && (
              <div className="mt-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">
                  Anteprima mobile hero
                </p>
                <div className="aspect-hero-mobile overflow-hidden rounded-xl border border-brand-500/40 bg-white">
                  <img
                    src={image.src}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: livePreviewPosition }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {isHeroMode && image && (
          <div className="mt-5 space-y-4 rounded-xl border border-ink-700 bg-ink-950/60 p-4">
            <p className="text-sm font-medium text-ink-200">Regolazione precisa</p>
            <div className="flex flex-wrap gap-2">
              {HERO_FOCUS_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyFocusPreset(preset.value)}
                  className="rounded-full border border-ink-600 px-3 py-1.5 text-xs text-ink-200 transition hover:border-brand-400 hover:text-white"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div>
              <label className="mb-2 flex justify-between text-sm text-ink-200">
                <span>Orizzontale</span>
                <span className="text-ink-400">{Math.round(focusPoint.x)}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={focusPoint.x}
                onChange={(e) => applyFocusPoint(parseFloat(e.target.value), focusPoint.y)}
                className="w-full"
              />
            </div>
            <div>
              <label className="mb-2 flex justify-between text-sm text-ink-200">
                <span>Verticale (0 = alto, 100 = basso)</span>
                <span className="text-ink-400">{Math.round(focusPoint.y)}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={focusPoint.y}
                onChange={(e) => applyFocusPoint(focusPoint.x, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <p className="text-xs text-ink-500">
              Posizione salvata: {livePreviewPosition}. Per personaggi, prova 15-30% sul verticale.
            </p>
          </div>
        )}

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-ink-200">
              <ZoomIn className="h-4 w-4" />
              Zoom
            </label>
            {image && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetOriginal}
                disabled={saving}
                className="h-9 shrink-0 gap-1.5 rounded-full px-3 text-ink-200 hover:bg-ink-800 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Ripristina originale
              </Button>
            )}
          </div>
          <input
            type="range"
            min={1}
            max={isHeroMode ? 4 : 3}
            step={0.05}
            value={transform.scale}
            onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {keepOriginalUpload && (
          <p className="mt-3 text-xs text-amber-300">
            File animato rilevato: verra caricato l&apos;originale mantenendo GIF o WebP animata.
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            Annulla
          </Button>
          {isExistingSource && onPositionOnly && (
            <Button type="button" variant="secondary" onClick={handlePositionOnly} disabled={saving || !image}>
              {saving ? "Salvataggio..." : "Applica posizione"}
            </Button>
          )}
          {!useOriginalOnConfirm && keepOriginalUpload && (
            <Button type="button" variant="secondary" onClick={handleConfirmOriginal} disabled={saving || !image}>
              {saving ? "Salvataggio..." : "Mantieni originale"}
            </Button>
          )}
          {!useOriginalOnConfirm && (
            <Button type="button" variant="secondary" onClick={handleConfirmCrop} disabled={saving || !image}>
              {saving ? "Salvataggio..." : "Ritaglia statico"}
            </Button>
          )}
          <Button type="button" onClick={handlePrimaryConfirm} disabled={saving || !image}>
            {saving ? "Salvataggio..." : useOriginalOnConfirm ? "Conferma con animazione" : "Conferma posizione"}
          </Button>
        </div>
      </div>
    </div>
  );
}

async function renderFocusedPreviewDataUrlInternal(
  img: HTMLImageElement,
  frameW: number,
  frameH: number,
  transform: ImageTransform,
  preferPng: boolean
): Promise<string> {
  const file = await renderFocusedImageFile(img, frameW, frameH, transform, "preview", preferPng);
  return URL.createObjectURL(file);
}
