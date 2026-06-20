import type {
  University,
  UniFaculty,
  UniSubject,
  UniResource,
  UniversityHubData,
} from "@/lib/types";

/**
 * Seed / mock data for the University Hub.
 *
 * This provides a realistic starting dataset so the hierarchy
 * (University → Faculty → Subject → Resource) can be explored and the
 * selector components have something to render before any real content is
 * created. All ids are stable, human-readable slugs so cross-references stay
 * easy to follow.
 */

export const MOCK_UNIVERSITIES: University[] = [
  {
    id: "uni-sorbonne",
    name: "Sorbonne University",
    shortName: "Sorbonne",
    location: "Paris, France",
    description:
      "A multidisciplinary research university in the heart of Paris.",
  },
  {
    id: "uni-mit",
    name: "Massachusetts Institute of Technology",
    shortName: "MIT",
    location: "Cambridge, USA",
    description: "Science and technology focused research institute.",
  },
];

export const MOCK_FACULTIES: UniFaculty[] = [
  {
    id: "fac-sorbonne-sciences",
    name: "Faculty of Sciences",
    universityId: "uni-sorbonne",
    description: "Mathematics, physics, computer science and more.",
  },
  {
    id: "fac-sorbonne-letters",
    name: "Faculty of Letters",
    universityId: "uni-sorbonne",
    description: "Humanities, languages and social sciences.",
  },
  {
    id: "fac-mit-eecs",
    name: "Electrical Engineering & Computer Science",
    universityId: "uni-mit",
    description: "EECS — the largest department at MIT.",
  },
];

export const MOCK_SUBJECTS: UniSubject[] = [
  {
    id: "sub-analysis-1",
    name: "Mathematical Analysis I",
    facultyId: "fac-sorbonne-sciences",
    code: "MATH101",
    level: "l1",
    semester: 1,
    description: "Limits, continuity, differentiation and integration.",
  },
  {
    id: "sub-algorithms",
    name: "Algorithms & Data Structures",
    facultyId: "fac-sorbonne-sciences",
    code: "CS201",
    level: "l2",
    semester: 1,
    description: "Core algorithmic techniques and complexity analysis.",
  },
  {
    id: "sub-linguistics",
    name: "General Linguistics",
    facultyId: "fac-sorbonne-letters",
    code: "LING110",
    level: "l1",
    semester: 2,
    description: "Phonetics, morphology, syntax and semantics.",
  },
  {
    id: "sub-circuits",
    name: "Circuits & Electronics",
    facultyId: "fac-mit-eecs",
    code: "6.002",
    level: "l2",
    semester: 1,
    description: "Fundamentals of circuit analysis and design.",
  },
];

export const MOCK_RESOURCES: UniResource[] = [
  {
    id: "res-analysis-course",
    name: "Lecture Notes — Limits & Continuity",
    type: "course",
    subjectId: "sub-analysis-1",
    note: "Full set of lecture notes for the first semester.",
    fileName: "analysis-lecture-notes.pdf",
    createdAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: "res-analysis-td",
    name: "Exercise Sheet 1",
    type: "td",
    subjectId: "sub-analysis-1",
    fileName: "td-1.pdf",
    createdAt: "2026-01-12T09:00:00.000Z",
  },
  {
    id: "res-algorithms-exam",
    name: "Final Exam 2025",
    type: "exam",
    subjectId: "sub-algorithms",
    note: "Past paper with solutions.",
    fileName: "algorithms-final-2025.pdf",
    createdAt: "2026-01-15T09:00:00.000Z",
  },
  {
    id: "res-circuits-tp",
    name: "Lab 1 — Resistor Networks",
    type: "tp",
    subjectId: "sub-circuits",
    fileName: "circuits-lab-1.pdf",
    createdAt: "2026-01-18T09:00:00.000Z",
  },
];

/** Assembled mock dataset used to seed empty storage. */
export const MOCK_UNIVERSITY_HUB_DATA: UniversityHubData = {
  universities: MOCK_UNIVERSITIES,
  faculties: MOCK_FACULTIES,
  subjects: MOCK_SUBJECTS,
  resources: MOCK_RESOURCES,
};

/** An empty dataset, used as the storage fallback when seeding is undesired. */
export const EMPTY_UNIVERSITY_HUB_DATA: UniversityHubData = {
  universities: [],
  faculties: [],
  subjects: [],
  resources: [],
};
