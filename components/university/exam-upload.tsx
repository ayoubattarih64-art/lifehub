"use client";

import {
  ResourceUploader,
  type NewResourceInput,
} from "@/components/university/resource-uploader";
import { getResourceType } from "@/lib/university";
import type { UniSubject } from "@/lib/types";

export interface ExamUploadProps {
  subjects: UniSubject[];
  hasFaculty?: boolean;
  /** Pin to a single subject (hides the subject selector). */
  fixedSubjectId?: string | null;
  onSubmit: (resource: NewResourceInput) => void;
  className?: string;
}

/**
 * ExamUpload — uploader specialised for past papers and mock exams.
 *
 * Thin wrapper over the shared ResourceUploader with the resource type fixed
 * to `exam`. Past papers are almost always scanned PDFs or images, so those
 * lead the accepted file types.
 */
export function ExamUpload({
  subjects,
  hasFaculty,
  fixedSubjectId,
  onSubmit,
  className,
}: ExamUploadProps) {
  const meta = getResourceType("exam");
  return (
    <section className={className} aria-label={`Upload ${meta.label}`}>
      <ResourceUploader
        type="exam"
        subjects={subjects}
        hasFaculty={hasFaculty}
        fixedSubjectId={fixedSubjectId}
        onSubmit={onSubmit}
        accept=".pdf,image/*,.doc,.docx"
      />
    </section>
  );
}
