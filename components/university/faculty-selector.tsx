"use client";

import { Field, Select } from "@/components/ui/input";
import type { UniFaculty } from "@/lib/types";

/**
 * FacultySelector — a reusable, controlled dropdown for picking a faculty.
 *
 * The parent is expected to pass only the faculties relevant to the chosen
 * university (e.g. via `facultiesForUniversity`). When no university is
 * selected yet, pass an empty list and the selector renders a helpful, locked
 * state instead of an empty box.
 */
export interface FacultySelectorProps {
  faculties: UniFaculty[];
  /** Currently selected faculty id, or null/empty when none. */
  value: string | null;
  onChange: (facultyId: string | null) => void;
  /** Whether a parent university has been chosen yet. */
  hasUniversity?: boolean;
  label?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export function FacultySelector({
  faculties,
  value,
  onChange,
  hasUniversity = true,
  label = "Faculty",
  hint,
  placeholder = "Select a faculty",
  disabled,
  id = "faculty-selector",
}: FacultySelectorProps) {
  const isEmpty = faculties.length === 0;

  const resolvedHint =
    hint ??
    (!hasUniversity
      ? "Choose a university first."
      : isEmpty
        ? "No faculties yet."
        : undefined);

  const resolvedPlaceholder = !hasUniversity
    ? "Select a university first"
    : placeholder;

  return (
    <Field label={label} htmlFor={id} hint={resolvedHint}>
      <Select
        id={id}
        value={value ?? ""}
        disabled={disabled || !hasUniversity || isEmpty}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">{resolvedPlaceholder}</option>
        {faculties.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </Select>
    </Field>
  );
}
