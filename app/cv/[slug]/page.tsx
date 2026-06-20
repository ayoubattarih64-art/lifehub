"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { readStorage } from "@/lib/storage";
import type { InteractiveCv } from "@/lib/types";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ExternalLinkIcon,
  MapPinIcon,
  MailIcon,
  LinkIcon,
} from "@/components/icons";

const DEFAULT: InteractiveCv = {
  fullName: "",
  title: "",
  bio: "",
  location: "",
  email: "",
  slug: "",
  skills: [],
  projects: [],
  education: [],
  socials: [],
};

export default function PublicCvPage() {
  const params = useParams<{ slug: string }>();
  const [hydrated, setHydrated] = useState(false);
  const [cv, setCv] = useState<InteractiveCv | null>(null);
  const loadedRef = useRef(false);

  // Read the persisted CV once after mount, without calling setState
  // synchronously inside the effect body.
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const stored = readStorage<InteractiveCv>("interactive-cv", DEFAULT);
    queueMicrotask(() => {
      setCv(stored);
      setHydrated(true);
    });
  }, []);


  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!cv || cv.slug !== params.slug || !cv.fullName) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
        <h1 className="text-2xl font-bold">CV not found</h1>
        <p className="max-w-md text-muted-foreground">
          No published CV matches this URL in your browser. CVs are stored
          locally, so this page only works on the device where it was created.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      {/* Hero */}
      <header className="bg-gradient-to-br from-primary/15 via-background to-background">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          {cv.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cv.photo}
              alt={cv.fullName}
              className="mx-auto h-28 w-28 rounded-full border-4 border-surface object-cover shadow-lg"
            />
          ) : (
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-primary/20 text-3xl font-bold text-primary">
              {cv.fullName.charAt(0)}
            </div>
          )}
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            {cv.fullName}
          </h1>
          {cv.title ? (
            <p className="mt-1 text-lg text-primary">{cv.title}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            {cv.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                {cv.location}
              </span>
            ) : null}
            {cv.email ? (
              <a
                href={`mailto:${cv.email}`}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <MailIcon className="h-4 w-4" />
                {cv.email}
              </a>
            ) : null}
          </div>
          {cv.socials.length ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {cv.socials.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-sm transition hover:bg-surface-muted"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  {s.label || s.url}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-12 px-6 py-12">
        {cv.bio ? (
          <section>
            <h2 className="mb-3 text-xl font-semibold">About</h2>
            <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {cv.bio}
            </p>
          </section>
        ) : null}

        {cv.skills.length ? (
          <section>
            <h2 className="mb-3 text-xl font-semibold">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {cv.skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {cv.projects.length ? (
          <section>
            <h2 className="mb-4 text-xl font-semibold">Projects</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {cv.projects.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-border bg-surface p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{p.name}</h3>
                    {p.link ? (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLinkIcon className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {cv.education.length ? (
          <section>
            <h2 className="mb-4 text-xl font-semibold">Education</h2>
            <div className="space-y-3">
              {cv.education.map((e) => (
                <div
                  key={e.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-5"
                >
                  <div>
                    <p className="font-semibold">{e.school}</p>
                    <p className="text-sm text-muted-foreground">{e.degree}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {e.period}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Built with LifeHub
      </footer>
    </div>
  );
}
