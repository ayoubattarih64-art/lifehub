import type { MemoryBookTemplate } from "@/lib/types";

export interface TemplateDef {
  key: MemoryBookTemplate;
  name: string;
  emoji: string;
  /** CSS color used as PDF accent. */
  accent: string;
  gradient: string;
  description: string;
}

export const MEMORY_TEMPLATES: TemplateDef[] = [
  {
    key: "wedding",
    name: "Wedding",
    emoji: "💍",
    accent: "#e11d48",
    gradient: "from-rose-500 to-pink-500",
    description: "Celebrate your special day with an elegant keepsake.",
  },
  {
    key: "graduation",
    name: "Graduation",
    emoji: "🎓",
    accent: "#7c3aed",
    gradient: "from-violet-500 to-purple-500",
    description: "Mark an academic milestone to remember forever.",
  },
  {
    key: "travel",
    name: "Travel",
    emoji: "✈️",
    accent: "#0891b2",
    gradient: "from-sky-500 to-cyan-500",
    description: "Relive your adventures in a magazine-style book.",
  },
  {
    key: "immigration",
    name: "Immigration Journey",
    emoji: "🌍",
    accent: "#0d9488",
    gradient: "from-emerald-500 to-teal-500",
    description: "Document a new chapter in a new country.",
  },
  {
    key: "umrah-hajj",
    name: "Umrah / Hajj",
    emoji: "🕋",
    accent: "#92400e",
    gradient: "from-amber-700 to-yellow-600",
    description: "Preserve the memories of a sacred journey.",
  },
  {
    key: "birthday",
    name: "Birthday",
    emoji: "🎂",
    accent: "#db2777",
    gradient: "from-pink-500 to-fuchsia-500",
    description: "A joyful book full of celebration and wishes.",
  },
  {
    key: "new-baby",
    name: "New Baby",
    emoji: "👶",
    accent: "#2563eb",
    gradient: "from-blue-400 to-indigo-400",
    description: "Welcome a new arrival with their first memories.",
  },
  {
    key: "success-story",
    name: "Success Story",
    emoji: "🏆",
    accent: "#ca8a04",
    gradient: "from-amber-500 to-orange-500",
    description: "Tell the story of an achievement worth sharing.",
  },
];

export function getTemplate(key: MemoryBookTemplate): TemplateDef {
  return MEMORY_TEMPLATES.find((t) => t.key === key) ?? MEMORY_TEMPLATES[0];
}
