"use client";

import {
  ResourceUploader,
  type NewResourceInput,
} from "@/components/university/resource-uploader";
import { getResourceType } from "@/lib/university";
import type { UniSubject } from "@/lib/types";

export interface CourseUploadProps {
  subjects: UniSubject[];
  hasFaculty?: boolean;
  /** Pin to a single subject (hides the subject selector). */
  fixedSubjectId?: string | null;
  onSubmit: (resource: NewResourceInput) => void;
  className?: string;
}

/**
 * CourseUpload — uploader specialised for lecture courses.
 *
 * A thin wrapper over the shared ResourceUploader that fixes the resource type
 * to `course`. Lecture material is typically slides/notes, so the accepted file
 * types are tuned accordingly.
 */
export function CourseUpload({
  subjects,
  hasFaculty,
  fixedSubjectId,
  onSubmit,
  className,
}: CourseUploadProps) {
  const meta = getResourceType("course");
  return (
    <section className={className} aria-label={`Upload ${meta.label}`}>
      <ResourceUploader
        type="course"
        subjects={subjects}
        hasFaculty={hasFaculty}
        fixedSubjectId={fixedSubjectId}
        onSubmit={onSubmit}
        accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,image/*"
      />
    </section>
  );
}
