"use client";

import {
  ResourceUploader,
  type NewResourceInput,
} from "@/components/university/resource-uploader";
import { getResourceType } from "@/lib/university";
import type { UniSubject } from "@/lib/types";

export interface TdUploadProps {
  subjects: UniSubject[];
  hasFaculty?: boolean;
  /** Pin to a single subject (hides the subject selector). */
  fixedSubjectId?: string | null;
  onSubmit: (resource: NewResourceInput) => void;
  className?: string;
}

/**
 * TdUpload — uploader specialised for tutorial / directed-work sheets (TD).
 *
 * Thin wrapper over the shared ResourceUploader with the resource type fixed
 * to `td`. TD material is usually exercise sheets, so PDFs and docs lead the
 * accepted file types.
 */
export function TdUpload({
  subjects,
  hasFaculty,
  fixedSubjectId,
  onSubmit,
  className,
}: TdUploadProps) {
  const meta = getResourceType("td");
  return (
    <section className={className} aria-label={`Upload ${meta.label}`}>
      <ResourceUploader
        type="td"
        subjects={subjects}
        hasFaculty={hasFaculty}
        fixedSubjectId={fixedSubjectId}
        onSubmit={onSubmit}
        accept=".pdf,.doc,.docx,.txt,image/*"
      />
    </section>
  );
}
