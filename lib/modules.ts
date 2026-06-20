import type { ComponentType, SVGProps } from "react";
import {
  BookOpenIcon,
  FamilyIcon,
  PlaneIcon,
  IdCardIcon,
  TargetIcon,
  GraduationCapIcon,
} from "@/components/icons";

export type ModuleKey =
  | "memory-books"
  | "family-archive"
  | "travel-journals"
  | "interactive-cv"
  | "challenge"
  | "university-hub";

export interface AppModule {
  key: ModuleKey;
  name: string;
  href: string;
  tagline: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Tailwind gradient classes for the module accent. */
  gradient: string;
}

export const MODULES: AppModule[] = [
  {
    key: "memory-books",
    name: "Memory Books",
    href: "/memory-books",
    tagline: "Turn moments into keepsakes",
    description:
      "Create beautiful PDF books from your memories using elegant templates for weddings, travel, milestones and more.",
    icon: BookOpenIcon,
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    key: "family-archive",
    name: "Family Archive",
    href: "/family-archive",
    tagline: "Preserve your family story",
    description:
      "Store family history, photos and a living family tree, then generate a printable family memory book.",
    icon: FamilyIcon,
    gradient: "from-rose-500 to-pink-500",
  },
  {
    key: "travel-journals",
    name: "Travel Journals",
    href: "/travel-journals",
    tagline: "Document every journey",
    description:
      "Capture photos, locations and notes from your trips and export them as magazine-style PDFs.",
    icon: PlaneIcon,
    gradient: "from-sky-500 to-cyan-500",
  },
  {
    key: "interactive-cv",
    name: "Interactive CV",
    href: "/interactive-cv",
    tagline: "Your portfolio, beautifully",
    description:
      "Build a professional portfolio with skills, projects, education and social links on a shareable public page.",
    icon: IdCardIcon,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    key: "challenge",
    name: "100 Day Challenge",
    href: "/challenge",
    tagline: "Build momentum daily",
    description:
      "Track a 100-day challenge with daily updates, photos and a complete progress history.",
    icon: TargetIcon,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    key: "university-hub",
    name: "University Hub",
    href: "/university-hub",
    tagline: "Organize your studies",
    description:
      "Upload and organize courses, TDs, exams and resources by university, faculty and subject.",
    icon: GraduationCapIcon,
    gradient: "from-violet-500 to-fuchsia-500",
  },
];

export function getModule(key: ModuleKey): AppModule | undefined {
  return MODULES.find((m) => m.key === key);
}
