"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

type ImageUploadFieldProps = {
  label: string;
  currentUrl?: string | null;
  required?: boolean;
  onChange: (file: File | null) => void;
};

export function ImageUploadField({
  label,
  currentUrl,
  required,
  onChange,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(file: File | null) {
    onChange(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  }

  const displayUrl = preview || currentUrl || null;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-200">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className="relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-ink-600 bg-ink-900/50 transition hover:border-brand-500"
      >
        {displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute right-2 top-2 rounded-full bg-ink-900/80 p-1.5 text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-ink-400">
            <Upload className="h-8 w-8" />
            <span className="text-sm">Clicca per caricare immagine</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
      />
    </div>
  );
}
