import Link from "next/link";
import { MODULES } from "@/lib/modules";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SparklesIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@/components/icons";

const HIGHLIGHTS = [
  "Local-first — your data stays in your browser",
  "Export beautiful, print-ready PDFs",
  "Dark & light mode, fully responsive",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
              <SparklesIcon className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">LifeHub</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button href="/dashboard" size="md">
              Open App
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted-foreground">
            <SparklesIcon className="h-4 w-4 text-primary" />
            Preserve the moments that matter
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Your life, beautifully{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              organized
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            LifeHub is the all-in-one platform to create memory books, archive
            family history, journal your travels, build an interactive CV, track
            challenges and organize your studies.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/dashboard" size="lg">
              Get started — it&apos;s free
              <ArrowRightIcon className="h-5 w-5" />
            </Button>
            <Button href="/memory-books" size="lg" variant="outline">
              Explore Memory Books
            </Button>
          </div>
          <ul className="mx-auto mt-10 flex max-w-2xl flex-col items-center justify-center gap-3 text-sm text-muted-foreground sm:flex-row sm:gap-6">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-emerald-500" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Modules grid */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything in one place
          </h2>
          <p className="mt-2 text-muted-foreground">
            Six powerful modules, one clean home for your memories and work.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.key}
                href={m.href}
                className="group rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${m.gradient} text-2xl text-white`}
                >
                  <Icon />
                </div>
                <h3 className="text-lg font-semibold">{m.name}</h3>
                <p className="mt-1 text-sm font-medium text-primary">
                  {m.tagline}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {m.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground opacity-0 transition group-hover:opacity-100">
                  Open <ArrowRightIcon className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-accent px-8 py-16 text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Start preserving your story today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            No sign-up required. Your data stays private in your browser.
          </p>
          <div className="mt-8">
            <Button
              href="/dashboard"
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              Open LifeHub
              <ArrowRightIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
        <p>LifeHub © {new Date().getFullYear()} — Built with Next.js.</p>
      </footer>
    </div>
  );
}
