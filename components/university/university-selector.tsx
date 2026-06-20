"use client";

import { Field, Select } from "@/components/ui/input";
import type { University } from "@/lib/types";

/**
 * UniversitySelector — a reusable, controlled dropdown for picking a
 * university. Purely presentational: the parent owns the data and selection
 * state, which keeps it composable with the data layer's query helpers.
 */
export interface UniversitySelectorProps {
  universities: University[];
  /** Currently selected university id, or null/empty when none. */
  value: string | null;
  onChange: (universityId: string | null) => void;
  label?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export function UniversitySelector({
  universities,
  value,
  onChange,
  label = "University",
  hint,
  placeholder = "Select a university",
  disabled,
  id = "university-selector",
}: UniversitySelectorProps) {
  const isEmpty = universities.length === 0;

  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint ?? (isEmpty ? "No universities yet." : undefined)}
    >
      <Select
        id={id}
        value={value ?? ""}
        disabled={disabled || isEmpty}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">{placeholder}</option>
        {universities.map((u) => (
          <option key={u.id} value={u.id}>
            {u.shortName ? `${u.name} (${u.shortName})` : u.name}
          </option>
        ))}
      </Select>
    </Field>
  );
}
