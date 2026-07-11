"use client";

import { useRef, useState } from "react";
import { Upload, X, Move } from "lucide-react";
import { SITE_ASSET_IMAGE_ACCEPT, resolveImageContentType } from "@/lib/images/content-type";
import {
  getPreviewAspectClass,
  type ImageFrameRatio,
} from "@/lib/images/image-focus";
import {
  ImagePositionEditor,
  type ImageUploadMeta,
} from "@/components/admin/image-position-editor";

export type { ImageUploadMeta };

type ImageUploadFieldProps = {
  label: string;
  currentUrl?: string | null;
  required?: boolean;
  aspectRatio?: ImageFrameRatio;
  allowKeepOriginal?: boolean;
  objectPosition?: string | null;
  onChange: (file: File | null, meta?: ImageUploadMeta) => void;
  onPositionOnly?: (meta: ImageUploadMeta) => void;
};

export function ImageUploadField({
  label,
  currentUrl,
  required,
  aspectRatio = "square",
  allowKeepOriginal = false,
  objectPosition,
  onChange,
  onPositionOnly,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [meta, setMeta] = useState<ImageUploadMeta | null>(null);
  const [editorSource, setEditorSource] = useState<File | string | null>(null);
  const [editorName, setEditorName] = useState("");
  const [editorType, setEditorType] = useState("image/jpeg");
  const [displayPosition, setDisplayPosition] = useState(objectPosition || "50% 50%");

  function openEditor(source: File | string, name: string, type: string) {
    setEditorSource(source);
    setEditorName(name);
    setEditorType(type);
  }

  function handleFileSelected(file: File | null) {
    if (!file) {
      setPreview(null);
      setMeta(null);
      setDisplayPosition("50% 50%");
      onChange(null);
      return;
    }
    openEditor(file, file.name, file.type || "image/jpeg");
  }

  function handleEditorCancel() {
    setEditorSource(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleEditorConfirm(file: File, nextMeta: ImageUploadMeta) {
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setMeta(nextMeta);
    setDisplayPosition(nextMeta.objectPosition);
    setEditorName(file.name);
    setEditorType(file.type || resolveImageContentType(file.name));
    onChange(file, nextMeta);
    setEditorSource(null);
  }

  function handleClear() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setMeta(null);
    setDisplayPosition("50% 50%");
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handlePositionOnlyMeta(nextMeta: ImageUploadMeta) {
    setMeta(nextMeta);
    setDisplayPosition(nextMeta.objectPosition);
    onPositionOnly?.(nextMeta);
    onChange(null, nextMeta);
    setEditorSource(null);
  }

  const displayUrl = preview || currentUrl || null;
  const aspectClass = getPreviewAspectClass(aspectRatio);
  const thumbPosition = meta?.objectPosition || displayPosition;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-200">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!displayUrl) inputRef.current?.click();
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !displayUrl) inputRef.current?.click();
        }}
        className={
          "relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-ink-600 bg-ink-900/50 transition hover:border-brand-500 " +
          aspectClass
        }
      >
        {displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: thumbPosition }}
            />
            <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/70 to-transparent p-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (preview) {
                    openEditor(
                      preview,
                      editorName || "immagine.jpg",
                      editorType
                    );
                    return;
                  }
                  if (currentUrl) {
                    const nameFromUrl = currentUrl.split("?")[0].split("/").pop() || "immagine.jpg";
                    openEditor(
                      currentUrl,
                      nameFromUrl,
                      resolveImageContentType(nameFromUrl)
                    );
                  }
                }}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-ink-900/90 px-2 py-1.5 text-xs text-white hover:bg-brand-600"
              >
                <Move className="h-3.5 w-3.5" />
                Regola
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="rounded-lg bg-ink-900/90 px-2 py-1.5 text-xs text-white hover:bg-brand-600"
              >
                Cambia
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="rounded-lg bg-red-600/90 p-1.5 text-white hover:bg-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-ink-400">
            <Upload className="h-8 w-8" />
            <span className="text-sm">Clicca per caricare immagine</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-ink-500">
        Dopo il caricamento puoi trascinare, zoomare e vedere l&apos;anteprima prima di confermare.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={SITE_ASSET_IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
      />

      {editorSource && (
        <ImagePositionEditor
          source={editorSource}
          sourceName={editorName}
          sourceType={editorType}
          aspectRatio={aspectRatio}
          allowKeepOriginal={allowKeepOriginal}
          initialObjectPosition={meta?.objectPosition || objectPosition}
          onCancel={handleEditorCancel}
          onConfirm={handleEditorConfirm}
          onConfirmOriginal={handleEditorConfirm}
          onPositionOnly={handlePositionOnlyMeta}
        />
      )}
    </div>
  );
}
