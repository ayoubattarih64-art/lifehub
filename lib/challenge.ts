import type { Challenge, ChallengeDay, ChallengeType } from "@/lib/types";

/**
 * Metadata + helpers for the 100 Day Challenge module.
 * Kept dependency-free so it can be imported from client components.
 */

export interface ChallengeTypeMeta {
  type: ChallengeType;
  label: string;
  emoji: string;
  description: string;
  /** Tailwind gradient classes for the accent. */
  gradient: string;
  /** Hex accent used for the exported summary / progress bar. */
  accent: string;
  /** Suggested goal placeholder. */
  goalPlaceholder: string;
}

export const CHALLENGE_TYPES: ChallengeTypeMeta[] = [
  {
    type: "fitness",
    label: "Fitness",
    emoji: "🏋️",
    description: "Workouts, running, strength or any physical goal.",
    gradient: "from-orange-500 to-red-500",
    accent: "#f97316",
    goalPlaceholder: "Run 5km every day",
  },
  {
    type: "learning",
    label: "Learning",
    emoji: "📚",
    description: "Study a language, course, or new skill daily.",
    gradient: "from-blue-500 to-indigo-500",
    accent: "#6366f1",
    goalPlaceholder: "Study Spanish for 30 minutes",
  },
  {
    type: "creative",
    label: "Creative",
    emoji: "🎨",
    description: "Draw, write, make music or build something.",
    gradient: "from-fuchsia-500 to-pink-500",
    accent: "#d946ef",
    goalPlaceholder: "Sketch one drawing a day",
  },
  {
    type: "wellness",
    label: "Wellness",
    emoji: "🧘",
    description: "Meditation, sleep, hydration and self-care.",
    gradient: "from-emerald-500 to-teal-500",
    accent: "#10b981",
    goalPlaceholder: "Meditate for 10 minutes",
  },
  {
    type: "productivity",
    label: "Productivity",
    emoji: "⚡",
    description: "Deep work, writing, side-projects or habits.",
    gradient: "from-amber-500 to-yellow-500",
    accent: "#f59e0b",
    goalPlaceholder: "Write 500 words",
  },
  {
    type: "habit",
    label: "Habit",
    emoji: "🌱",
    description: "Quit or build any everyday habit.",
    gradient: "from-lime-500 to-green-500",
    accent: "#84cc16",
    goalPlaceholder: "No sugar today",
  },
  {
    type: "custom",
    label: "Custom",
    emoji: "🎯",
    description: "Anything else you want to commit to.",
    gradient: "from-slate-500 to-zinc-500",
    accent: "#64748b",
    goalPlaceholder: "Describe your goal",
  },
];

export function getChallengeType(type: ChallengeType): ChallengeTypeMeta {
  return (
    CHALLENGE_TYPES.find((t) => t.type === type) ??
    CHALLENGE_TYPES[CHALLENGE_TYPES.length - 1]
  );
}

/* ---------------- Date helpers ---------------- */

/** Local YYYY-MM-DD key for a Date (avoids UTC drift from toISOString). */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

/** Parse a YYYY-MM-DD key into a local Date at midnight. */
export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Whole-day difference between two date keys (b - a). */
export function dayDiff(a: string, b: string): number {
  const ms = parseKey(b).getTime() - parseKey(a).getTime();
  return Math.round(ms / 86_400_000);
}

/** 1-based day number within the challenge for a given date key. */
export function dayNumberFor(challenge: Challenge, key: string): number {
  return dayDiff(challenge.startDate, key) + 1;
}

/* ---------------- Stats ---------------- */

export interface ChallengeStats {
  completedCount: number;
  totalDays: number;
  percent: number;
  currentStreak: number;
  longestStreak: number;
  daysElapsed: number;
  daysRemaining: number;
  consistency: number; // completed / elapsed
}

function completedKeysSorted(challenge: Challenge): string[] {
  return challenge.days
    .filter((d) => d.completed)
    .map((d) => d.date)
    .filter(Boolean)
    .sort((a, b) => parseKey(a).getTime() - parseKey(b).getTime());
}

export function computeStats(challenge: Challenge): ChallengeStats {
  const keys = completedKeysSorted(challenge);
  const completedCount = keys.length;
  const totalDays = challenge.totalDays || 100;

  // Longest streak across all completed days.
  let longestStreak = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of keys) {
    if (prev !== null && dayDiff(prev, k) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
    prev = k;
  }

  // Current streak: counted back from today (or yesterday if today missing).
  const completedSet = new Set(keys);
  let currentStreak = 0;
  const cursor = new Date();
  if (!completedSet.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (completedSet.has(dateKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const elapsedRaw = dayDiff(challenge.startDate, todayKey()) + 1;
  const daysElapsed = Math.max(0, Math.min(elapsedRaw, totalDays));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const percent = Math.round((completedCount / totalDays) * 100);
  const consistency =
    daysElapsed > 0 ? Math.round((completedCount / daysElapsed) * 100) : 0;

  return {
    completedCount,
    totalDays,
    percent,
    currentStreak,
    longestStreak,
    daysElapsed,
    daysRemaining,
    consistency,
  };
}

/** Find an existing day entry by its date key. */
export function findDay(
  challenge: Challenge,
  key: string
): ChallengeDay | undefined {
  return challenge.days.find((d) => d.date === key);
}
