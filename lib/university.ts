"use client";

import { useCallback } from "react";

import { useLocalStorage } from "@/lib/storage";
import { MOCK_UNIVERSITY_HUB_DATA } from "@/lib/university-mock";
import type {
  University,
  UniFaculty,
  UniSubject,
  UniResource,
  UniversityHubData,
  ResourceType,
  StudyLevel,
} from "@/lib/types";

/**
 * University Hub data layer.
 *
 * Persists the full hierarchy (University → Faculty → Subject → Resource) in
 * localStorage under a single namespaced key. Entities are stored in flat
 * collections and linked by id, so reads stay cheap and updates never require
 * deep mutation. This file is dependency-free (aside from storage) so it can
 * be imported safely from any client component.
 */

export const UNIVERSITY_STORAGE_KEY = "university-hub";

/** Seeded by default so the selectors have content to display on first run. */
export const DEFAULT_UNIVERSITY_HUB_DATA: UniversityHubData =
  MOCK_UNIVERSITY_HUB_DATA;

/* ---------------- Resource type metadata ---------------- */

export interface ResourceTypeMeta {
  type: ResourceType;
  label: string;
  /** Short tag shown on chips / badges. */
  short: string;
  description: string;
  /** Maps onto the existing Badge component variants. */
  badgeVariant: "default" | "primary" | "success" | "warning" | "outline";
}

export const RESOURCE_TYPES: ResourceTypeMeta[] = [
  {
    type: "course",
    label: "Course",
    short: "Course",
    description: "Lecture notes, slides and reading material.",
    badgeVariant: "primary",
  },
  {
    type: "td",
    label: "Tutorial (TD)",
    short: "TD",
    description: "Directed work — exercise sheets and tutorials.",
    badgeVariant: "success",
  },
  {
    type: "tp",
    label: "Practical (TP)",
    short: "TP",
    description: "Lab work and practical assignments.",
    badgeVariant: "warning",
  },
  {
    type: "exam",
    label: "Exam",
    short: "Exam",
    description: "Past papers, mock exams and solutions.",
    badgeVariant: "outline",
  },
  {
    type: "other",
    label: "Other",
    short: "Other",
    description: "Any other study resource.",
    badgeVariant: "default",
  },
];

export function getResourceType(type: ResourceType): ResourceTypeMeta {
  return (
    RESOURCE_TYPES.find((t) => t.type === type) ??
    RESOURCE_TYPES[RESOURCE_TYPES.length - 1]
  );
}

/* ---------------- Study level metadata ---------------- */

export interface StudyLevelMeta {
  level: StudyLevel;
  label: string;
  short: string;
}

export const STUDY_LEVELS: StudyLevelMeta[] = [
  { level: "l1", label: "Licence 1", short: "L1" },
  { level: "l2", label: "Licence 2", short: "L2" },
  { level: "l3", label: "Licence 3", short: "L3" },
  { level: "m1", label: "Master 1", short: "M1" },
  { level: "m2", label: "Master 2", short: "M2" },
  { level: "phd", label: "Doctorate", short: "PhD" },
  { level: "other", label: "Other", short: "—" },
];

export function getStudyLevel(level: StudyLevel): StudyLevelMeta {
  return (
    STUDY_LEVELS.find((l) => l.level === level) ??
    STUDY_LEVELS[STUDY_LEVELS.length - 1]
  );
}

/* ---------------- Id helper ---------------- */

/** Generate a reasonably-unique id for a new entity. */
export function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

/* ---------------- Pure query helpers ---------------- */

export function getUniversity(
  data: UniversityHubData,
  universityId: string | null | undefined
): University | undefined {
  if (!universityId) return undefined;
  return data.universities.find((u) => u.id === universityId);
}

export function getFaculty(
  data: UniversityHubData,
  facultyId: string | null | undefined
): UniFaculty | undefined {
  if (!facultyId) return undefined;
  return data.faculties.find((f) => f.id === facultyId);
}

export function getSubject(
  data: UniversityHubData,
  subjectId: string | null | undefined
): UniSubject | undefined {
  if (!subjectId) return undefined;
  return data.subjects.find((s) => s.id === subjectId);
}

/** Faculties belonging to a given university. */
export function facultiesForUniversity(
  data: UniversityHubData,
  universityId: string | null | undefined
): UniFaculty[] {
  if (!universityId) return [];
  return data.faculties.filter((f) => f.universityId === universityId);
}

/** Subjects belonging to a given faculty. */
export function subjectsForFaculty(
  data: UniversityHubData,
  facultyId: string | null | undefined
): UniSubject[] {
  if (!facultyId) return [];
  return data.subjects.filter((s) => s.facultyId === facultyId);
}

/** Resources belonging to a given subject. */
export function resourcesForSubject(
  data: UniversityHubData,
  subjectId: string | null | undefined
): UniResource[] {
  if (!subjectId) return [];
  return data.resources.filter((r) => r.subjectId === subjectId);
}

/* ---------------- Resource organization ---------------- */

/**
 * A group of resources of a single type, paired with its display metadata.
 * Used by the resource organization system to render typed sections.
 */
export interface ResourceGroup {
  meta: ResourceTypeMeta;
  resources: UniResource[];
}

/**
 * Group an arbitrary list of resources by their type, preserving the canonical
 * ordering declared in RESOURCE_TYPES. By default empty groups are dropped so
 * callers can map straight to sections; pass `includeEmpty` to keep them.
 */
export function groupResourcesByType(
  resources: UniResource[],
  options: { includeEmpty?: boolean } = {}
): ResourceGroup[] {
  const { includeEmpty = false } = options;
  return RESOURCE_TYPES.map((meta) => ({
    meta,
    resources: resources.filter((r) => r.type === meta.type),
  })).filter((group) => includeEmpty || group.resources.length > 0);
}

/**
 * Sort resources newest-first by their creation timestamp. Returns a new array
 * and never mutates the input.
 */
export function sortResourcesByNewest(resources: UniResource[]): UniResource[] {
  return [...resources].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

/** Human-readable file size, e.g. 2048 → "2 KB". */
export function formatFileSize(bytes: number | undefined): string {
  if (bytes == null || Number.isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[unit]}`;
}

/** Count of resources nested under a faculty (across all its subjects). */
export function resourceCountForFaculty(
  data: UniversityHubData,
  facultyId: string
): number {
  const subjectIds = new Set(
    subjectsForFaculty(data, facultyId).map((s) => s.id)
  );
  return data.resources.filter((r) => subjectIds.has(r.subjectId)).length;
}

/** Count of resources nested under a university (across all faculties). */
export function resourceCountForUniversity(
  data: UniversityHubData,
  universityId: string
): number {
  const facultyIds = facultiesForUniversity(data, universityId).map(
    (f) => f.id
  );
  return facultyIds.reduce(
    (total, fid) => total + resourceCountForFaculty(data, fid),
    0
  );
}

/* ---------------- Hook ---------------- */

/**
 * useUniversityHub — central hook for reading and mutating the hub data.
 *
 * Mirrors the conventions used by useVerification: hydration-safe state via
 * useLocalStorage, with memoised, immutable update helpers. Mutations operate
 * on the flat collections and clean up orphaned children on delete.
 */
export function useUniversityHub() {
  const [data, setData, hydrated] = useLocalStorage<UniversityHubData>(
    UNIVERSITY_STORAGE_KEY,
    DEFAULT_UNIVERSITY_HUB_DATA
  );

  /* ----- Universities ----- */

  const addUniversity = useCallback(
    (input: Omit<University, "id">): University => {
      const university: University = { ...input, id: createId("uni") };
      setData((prev) => ({
        ...prev,
        universities: [...prev.universities, university],
      }));
      return university;
    },
    [setData]
  );

  const updateUniversity = useCallback(
    (id: string, patch: Partial<Omit<University, "id">>) => {
      setData((prev) => ({
        ...prev,
        universities: prev.universities.map((u) =>
          u.id === id ? { ...u, ...patch } : u
        ),
      }));
    },
    [setData]
  );

  const removeUniversity = useCallback(
    (id: string) => {
      setData((prev) => {
        const facultyIds = new Set(
          prev.faculties.filter((f) => f.universityId === id).map((f) => f.id)
        );
        const subjectIds = new Set(
          prev.subjects
            .filter((s) => facultyIds.has(s.facultyId))
            .map((s) => s.id)
        );
        return {
          universities: prev.universities.filter((u) => u.id !== id),
          faculties: prev.faculties.filter((f) => f.universityId !== id),
          subjects: prev.subjects.filter((s) => !facultyIds.has(s.facultyId)),
          resources: prev.resources.filter(
            (r) => !subjectIds.has(r.subjectId)
          ),
        };
      });
    },
    [setData]
  );

  /* ----- Faculties ----- */

  const addFaculty = useCallback(
    (input: Omit<UniFaculty, "id">): UniFaculty => {
      const faculty: UniFaculty = { ...input, id: createId("fac") };
      setData((prev) => ({
        ...prev,
        faculties: [...prev.faculties, faculty],
      }));
      return faculty;
    },
    [setData]
  );

  const updateFaculty = useCallback(
    (id: string, patch: Partial<Omit<UniFaculty, "id">>) => {
      setData((prev) => ({
        ...prev,
        faculties: prev.faculties.map((f) =>
          f.id === id ? { ...f, ...patch } : f
        ),
      }));
    },
    [setData]
  );

  const removeFaculty = useCallback(
    (id: string) => {
      setData((prev) => {
        const subjectIds = new Set(
          prev.subjects.filter((s) => s.facultyId === id).map((s) => s.id)
        );
        return {
          ...prev,
          faculties: prev.faculties.filter((f) => f.id !== id),
          subjects: prev.subjects.filter((s) => s.facultyId !== id),
          resources: prev.resources.filter(
            (r) => !subjectIds.has(r.subjectId)
          ),
        };
      });
    },
    [setData]
  );

  /* ----- Subjects ----- */

  const addSubject = useCallback(
    (input: Omit<UniSubject, "id">): UniSubject => {
      const subject: UniSubject = { ...input, id: createId("sub") };
      setData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, subject],
      }));
      return subject;
    },
    [setData]
  );

  const updateSubject = useCallback(
    (id: string, patch: Partial<Omit<UniSubject, "id">>) => {
      setData((prev) => ({
        ...prev,
        subjects: prev.subjects.map((s) =>
          s.id === id ? { ...s, ...patch } : s
        ),
      }));
    },
    [setData]
  );

  const removeSubject = useCallback(
    (id: string) => {
      setData((prev) => ({
        ...prev,
        subjects: prev.subjects.filter((s) => s.id !== id),
        resources: prev.resources.filter((r) => r.subjectId !== id),
      }));
    },
    [setData]
  );

  /* ----- Resources ----- */

  const addResource = useCallback(
    (input: Omit<UniResource, "id" | "createdAt">): UniResource => {
      const resource: UniResource = {
        ...input,
        id: createId("res"),
        createdAt: new Date().toISOString(),
      };
      setData((prev) => ({
        ...prev,
        resources: [...prev.resources, resource],
      }));
      return resource;
    },
    [setData]
  );

  const updateResource = useCallback(
    (id: string, patch: Partial<Omit<UniResource, "id" | "createdAt">>) => {
      setData((prev) => ({
        ...prev,
        resources: prev.resources.map((r) =>
          r.id === id ? { ...r, ...patch } : r
        ),
      }));
    },
    [setData]
  );

  const removeResource = useCallback(
    (id: string) => {
      setData((prev) => ({
        ...prev,
        resources: prev.resources.filter((r) => r.id !== id),
      }));
    },
    [setData]
  );

  /* ----- Reset ----- */

  const reset = useCallback(() => {
    setData(DEFAULT_UNIVERSITY_HUB_DATA);
  }, [setData]);

  return {
    data,
    hydrated,
    // universities
    addUniversity,
    updateUniversity,
    removeUniversity,
    // faculties
    addFaculty,
    updateFaculty,
    removeFaculty,
    // subjects
    addSubject,
    updateSubject,
    removeSubject,
    // resources
    addResource,
    updateResource,
    removeResource,
    // misc
    reset,

  } as const;
}
