"use client";

import { Badge } from "@/components/ui/badge";
import {
  FileIcon,
  LinkIcon,
  DownloadIcon,
  ExternalLinkIcon,
  TrashIcon,
} from "@/components/icons";
import { formatFileSize, getResourceType } from "@/lib/university";
import { cn } from "@/lib/utils";
import type { UniResource } from "@/lib/types";

export interface ResourceCardProps {
  resource: UniResource;
  /** Called when the user removes the resource. Omit to hide the action. */
  onRemove?: (id: string) => void;
  className?: string;
}

/** Whether a url points to an uploaded file (data URL) vs an external link. */
function isDataUrl(url: string | undefined): boolean {
  return Boolean(url && url.startsWith("data:"));
}

/** Short, human-friendly date — e.g. "20 Jun 2026". */
function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * ResourceCard — a single study resource rendered as a compact card.
 *
 * Surfaces the resource type (as a Badge using the canonical variant), its
 * title, attached file metadata or external-link affordance, an optional note
 * and the upload date. The primary action adapts to the resource: uploaded
 * files get a Download control, external links get an Open control. An optional
 * remove action is shown when `onRemove` is provided.
 *
 * Purely presentational and self-contained — it reads only from the passed
 * resource and the shared resource-type metadata, so it slots into any list,
 * grid or organization view without extra wiring.
 */
export function ResourceCard({
  resource,
  onRemove,
  className,
}: ResourceCardProps) {
  const meta = getResourceType(resource.type);
  const fileUrl = resource.url;
  const isLink = Boolean(fileUrl) && !isDataUrl(fileUrl);

  return (
    <div
      className={cn(
        "group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:border-primary/40 sm:flex-row sm:items-start sm:gap-4",
        className
      )}
    >
      {/* Leading icon */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-surface-muted text-muted-foreground">
        {isLink ? (
          <LinkIcon className="h-5 w-5" />
        ) : (
          <FileIcon className="h-5 w-5" />
        )}
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="min-w-0 truncate text-sm font-semibold">
            {resource.name}
          </h4>
          <Badge variant={meta.badgeVariant}>{meta.short}</Badge>
        </div>

        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          {resource.fileName ? (
            <span className="truncate">{resource.fileName}</span>
          ) : isLink ? (
            <span className="truncate">External link</span>
          ) : null}
          {resource.fileSize ? (
            <>
              <span aria-hidden>·</span>
              <span>{formatFileSize(resource.fileSize)}</span>
            </>
          ) : null}
          <span aria-hidden>·</span>
          <span>{formatDate(resource.createdAt)}</span>
        </p>

        {resource.note ? (
          <p className="mt-2 text-sm text-muted-foreground">{resource.note}</p>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 items-center gap-1 sm:self-center">
        {fileUrl ? (
          isLink ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
              aria-label={`Open ${resource.name}`}
            >
              <ExternalLinkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Open</span>
            </a>
          ) : (
            <a
              href={fileUrl}
              download={resource.fileName ?? resource.name}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
              aria-label={`Download ${resource.name}`}
            >
              <DownloadIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )
        ) : null}

        {onRemove ? (
          <button
            type="button"
            onClick={() => onRemove(resource.id)}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-border hover:text-red-500"
            aria-label={`Remove ${resource.name}`}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
