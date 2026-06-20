/**
 * Shared domain types for all LifeHub modules.
 */

/* ---------- Memory Books ---------- */

export type MemoryBookTemplate =
  | "wedding"
  | "graduation"
  | "travel"
  | "immigration"
  | "umrah-hajj"
  | "birthday"
  | "new-baby"
  | "success-story";

export interface MemoryPage {
  id: string;
  heading: string;
  text: string;
  images: string[]; // data URLs
}

export interface MemoryBook {
  id: string;
  title: string;
  subtitle: string;
  template: MemoryBookTemplate;
  coverImage?: string;
  pages: MemoryPage[];
  createdAt: string;
  updatedAt: string;
}

/* ---------- Family Archive ---------- */

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  birthYear?: string;
  note?: string;
  photo?: string;
}

export interface FamilyStory {
  id: string;
  title: string;
  content: string;
  year?: string;
  images: string[];
}

export interface FamilyArchive {
  members: FamilyMember[];
  stories: FamilyStory[];
}

/* ---------- Travel Journals ---------- */

export interface TravelEntry {
  id: string;
  day: string; // date
  location: string;
  notes: string;
  images: string[];
}

export interface TravelJournal {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  entries: TravelEntry[];
  createdAt: string;
}

/* ---------- Interactive CV ---------- */

export interface CvProject {
  id: string;
  name: string;
  description: string;
  link?: string;
}

export interface CvEducation {
  id: string;
  school: string;
  degree: string;
  period: string;
}

export interface CvSocialLink {
  id: string;
  label: string;
  url: string;
}

export interface InteractiveCv {
  fullName: string;
  title: string;
  bio: string;
  photo?: string;
  location: string;
  email: string;
  slug: string;
  skills: string[];
  projects: CvProject[];
  education: CvEducation[];
  socials: CvSocialLink[];
}

/* ---------- 100 Day Challenge ---------- */

export type ChallengeType =
  | "fitness"
  | "learning"
  | "creative"
  | "wellness"
  | "productivity"
  | "habit"
  | "custom";

export interface ChallengeDay {
  id: string;
  dayNumber: number;
  date: string;
  note: string;
  image?: string;
  completed: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  type: ChallengeType;
  goal: string;
  startDate: string;
  totalDays: number;
  days: ChallengeDay[];
  createdAt: string;
}


/* ---------- University Hub ---------- */

/**
 * University Hub uses a four-level hierarchy:
 *   University → Faculty → Subject → Resource
 * Each level is addressable by a stable id so resources can be filtered,
 * grouped and (later) searched without ambiguity.
 */

export type ResourceType = "course" | "td" | "tp" | "exam" | "other";

/** A study level / academic year within a faculty (e.g. "L1", "M2"). */
export type StudyLevel =
  | "l1"
  | "l2"
  | "l3"
  | "m1"
  | "m2"
  | "phd"
  | "other";

/** A single study resource (course note, exercise sheet, past exam, etc.). */
export interface UniResource {
  id: string;
  name: string;
  type: ResourceType;
  /** Id of the owning subject. */
  subjectId: string;
  note?: string;
  fileName?: string;
  /** Size in bytes of the uploaded file, when known. */
  fileSize?: number;
  /** MIME type of the uploaded file, when known. */
  fileType?: string;
  /** data URL or external link. */
  url?: string;
  createdAt: string;
}

/** A subject / course module taught within a faculty. */
export interface UniSubject {
  id: string;
  name: string;
  /** Id of the owning faculty. */
  facultyId: string;
  /** Optional short code, e.g. "MATH101". */
  code?: string;
  level?: StudyLevel;
  /** Semester number within the level (1, 2, ...). */
  semester?: number;
  description?: string;
}

/** A faculty / school / department within a university. */
export interface UniFaculty {
  id: string;
  name: string;
  /** Id of the owning university. */
  universityId: string;
  description?: string;
}

/** A university / higher-education institution. */
export interface University {
  id: string;
  name: string;
  /** Optional short name or abbreviation, e.g. "MIT". */
  shortName?: string;
  /** City / region the institution is located in. */
  location?: string;
  description?: string;
}

/**
 * The complete University Hub dataset as persisted in storage. Each entity
 * is stored in a flat collection and linked by id, which keeps updates cheap
 * and avoids deeply-nested mutation.
 */
export interface UniversityHubData {
  universities: University[];
  faculties: UniFaculty[];
  subjects: UniSubject[];
  resources: UniResource[];
}


/* ---------- Verification System ---------- */

export type VerificationStatus = "unverified" | "pending" | "verified";

export interface VerificationState {
  email: string;
  status: VerificationStatus;
  /** ISO timestamp of when verification completed. */
  verifiedAt?: string;
  /** ISO timestamp of when the last code was issued. */
  lastSentAt?: string;
  /** Number of times a code has been requested in the current flow. */
  attempts: number;
}


