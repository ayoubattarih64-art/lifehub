"use client";

import { useRef, useState } from "react";
import { filesToDataUrls, fileToDataUrl } from "@/lib/image";
import { cn } from "@/lib/utils";
import { PlusIcon, TrashIcon } from "@/components/icons";

interface PhotoUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  className?: string;
}

/** Grid uploader supporting multiple images stored as data URLs. */
export function PhotoUploader({
  images,
  onChange,
  multiple = true,
  className,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const urls = await filesToDataUrls(files);
      onChange(multiple ? [...images, ...urls] : urls.slice(0, 1));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((src, i) => (
          <div
            key={i}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute right-1 top-1 rounded-lg bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
              aria-label="Remove image"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted-foreground transition hover:bg-surface-muted disabled:opacity-50"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="text-xs">{busy ? "Adding…" : "Add"}</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

interface SingleImageUploaderProps {
  image?: string;
  onChange: (image: string | undefined) => void;
  label?: string;
  rounded?: "xl" | "full";
  className?: string;
}

/** Single-image uploader (cover photo / avatar). */
export function SingleImageUploader({
  image,
  onChange,
  label = "Upload image",
  rounded = "xl",
  className,
}: SingleImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const url = await fileToDataUrl(file);
      onChange(url);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div
        className={cn(
          "relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden border border-border bg-surface-muted text-muted-foreground",
          rounded === "full" ? "rounded-full" : "rounded-xl"
        )}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <PlusIcon className="h-6 w-6" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-xl border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-surface-muted disabled:opacity-50"
        >
          {busy ? "Uploading…" : label}
        </button>
        {image ? (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-left text-xs text-red-500"
          >
            Remove
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
