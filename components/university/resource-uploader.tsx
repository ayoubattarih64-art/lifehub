"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { FileIcon, TrashIcon, PlusIcon } from "@/components/icons";
import { SubjectSelector } from "@/components/university/subject-selector";
import { formatFileSize, getResourceType } from "@/lib/university";
import { cn } from "@/lib/utils";
import type { ResourceType, UniResource, UniSubject } from "@/lib/types";

/**
 * Shape of a newly-built resource ready to be persisted. Mirrors UniResource
 * without the fields the data layer assigns (`id`, `createdAt`).
 */
export type NewResourceInput = Omit<UniResource, "id" | "createdAt">;

/** Picked file metadata + data URL, held in local state before submission. */
interface PickedFile {
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
}

/** Read any File into a data URL (works for PDFs, docs, slides, images…). */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export interface ResourceUploaderProps {
  /** Fixed resource type this uploader produces (course, td, exam…). */
  type: ResourceType;
  /** Subjects available for selection (already scoped to a faculty by parent). */
  subjects: UniSubject[];
  /** Whether a faculty has been chosen (drives the subject selector state). */
  hasFaculty?: boolean;
  /**
   * Optionally pin the uploader to a single subject. When provided the
   * SubjectSelector is hidden and submissions always target this subject.
   */
  fixedSubjectId?: string | null;
  /** Called with a complete resource payload when the user submits. */
  onSubmit: (resource: NewResourceInput) => void;
  /** Accepted file types for the file input. */
  accept?: string;
  className?: string;
}

/**
 * ResourceUploader — the shared engine behind Course / TD / Exam uploaders.
 *
 * Collects a name, an optional file (stored as a data URL) or external link,
 * and an optional note, then emits a typed resource payload. The resource
 * `type` is fixed by the caller so each wrapper stays single-purpose, and the
 * existing SubjectSelector is reused for choosing where the resource lives.
 */
export function ResourceUploader({
  type,
  subjects,
  hasFaculty = true,
  fixedSubjectId,
  onSubmit,
  accept = ".pdf,.doc,.docx,.ppt,.pptx,.txt,image/*",
  className,
}: ResourceUploaderProps) {
  const meta = getResourceType(type);
  const inputRef = useRef<HTMLInputElement>(null);

  const [subjectId, setSubjectId] = useState<string | null>(
    fixedSubjectId ?? null
  );
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<PickedFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveSubjectId = fixedSubjectId ?? subjectId;
  const canSubmit =
    Boolean(effectiveSubjectId) &&
    name.trim().length > 0 &&
    (Boolean(file) || link.trim().length > 0);

  async function handleFile(picked: File | undefined) {
    if (!picked) return;
    setBusy(true);
    setError(null);
    try {
      const url = await fileToDataUrl(picked);
      setFile({
        fileName: picked.name,
        fileSize: picked.size,
        fileType: picked.type || "application/octet-stream",
        url,
      });
      // Auto-fill the name from the file when the user hasn't typed one.
      if (!name.trim()) {
        setName(picked.name.replace(/\.[^.]+$/, ""));
      }
    } catch {
      setError("Couldn't read that file. Please try another.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function clearFile() {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function reset() {
    setName("");
    setLink("");
    setNote("");
    setFile(null);
    if (!fixedSubjectId) setSubjectId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!effectiveSubjectId) {
      setError("Choose a subject first.");
      return;
    }
    if (!canSubmit) return;

    const payload: NewResourceInput = {
      name: name.trim(),
      type,
      subjectId: effectiveSubjectId,
      note: note.trim() || undefined,
      ...(file
        ? {
            fileName: file.fileName,
            fileSize: file.fileSize,
            fileType: file.fileType,
            url: file.url,
          }
        : { url: link.trim() }),
    };

    onSubmit(payload);
    reset();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-4", className)}
    >
      {!fixedSubjectId ? (
        <SubjectSelector
          subjects={subjects}
          value={subjectId}
          onChange={setSubjectId}
          hasFaculty={hasFaculty}
          hint="Where should this resource be filed?"
        />
      ) : null}

      <Field label={`${meta.label} title`} htmlFor={`res-name-${type}`}>
        <Input
          id={`res-name-${type}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`e.g. ${meta.label} — Chapter 1`}
        />
      </Field>

      {/* File picker */}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {file ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted px-3 py-2.5">
            <FileIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.fileSize)}
              </p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-border hover:text-red-500"
              aria-label="Remove file"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-surface/50 px-4 py-6 text-muted-foreground transition hover:bg-surface-muted disabled:opacity-50"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="text-sm">
              {busy ? "Reading file…" : "Attach a file"}
            </span>
            <span className="text-xs text-muted-foreground">
              PDF, slides, docs or images
            </span>
          </button>
        )}
      </div>

      <Field
        label="Or paste a link"
        htmlFor={`res-link-${type}`}
        hint="Use a file above, or link to an external resource."
      >
        <Input
          id={`res-link-${type}`}
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://…"
          disabled={Boolean(file)}
        />
      </Field>

      <Field label="Note (optional)" htmlFor={`res-note-${type}`}>
        <Textarea
          id={`res-note-${type}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything worth remembering about this resource…"
        />
      </Field>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={!canSubmit || busy}>
          Add {meta.label}
        </Button>
      </div>
    </form>
  );
}
