"use client";

import { Field, Select } from "@/components/ui/input";
import { getStudyLevel } from "@/lib/university";
import type { UniSubject } from "@/lib/types";

/**
 * SubjectSelector — a reusable, controlled dropdown for picking a subject.
 *
 * The parent passes only the subjects belonging to the chosen faculty (e.g.
 * via `subjectsForFaculty`). Each option surfaces the optional code and study
 * level so similarly-named modules stay distinguishable.
 */
export interface SubjectSelectorProps {
  subjects: UniSubject[];
  /** Currently selected subject id, or null/empty when none. */
  value: string | null;
  onChange: (subjectId: string | null) => void;
  /** Whether a parent faculty has been chosen yet. */
  hasFaculty?: boolean;
  label?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

function subjectLabel(subject: UniSubject): string {
  const parts: string[] = [];
  if (subject.code) parts.push(subject.code);
  parts.push(subject.name);
  const tail: string[] = [];
  if (subject.level) tail.push(getStudyLevel(subject.level).short);
  if (subject.semester) tail.push(`S${subject.semester}`);
  const suffix = tail.length ? ` · ${tail.join(" ")}` : "";
  return `${parts.join(" — ")}${suffix}`;
}

export function SubjectSelector({
  subjects,
  value,
  onChange,
  hasFaculty = true,
  label = "Subject",
  hint,
  placeholder = "Select a subject",
  disabled,
  id = "subject-selector",
}: SubjectSelectorProps) {
  const isEmpty = subjects.length === 0;

  const resolvedHint =
    hint ??
    (!hasFaculty
      ? "Choose a faculty first."
      : isEmpty
        ? "No subjects yet."
        : undefined);

  const resolvedPlaceholder = !hasFaculty
    ? "Select a faculty first"
    : placeholder;

  return (
    <Field label={label} htmlFor={id} hint={resolvedHint}>
      <Select
        id={id}
        value={value ?? ""}
        disabled={disabled || !hasFaculty || isEmpty}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">{resolvedPlaceholder}</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {subjectLabel(s)}
          </option>
        ))}
      </Select>
    </Field>
  );
}
