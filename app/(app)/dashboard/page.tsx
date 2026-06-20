import Link from "next/link";
import { MODULES } from "@/lib/modules";
import { PageHeader } from "@/components/layout/page-header";
import { ArrowRightIcon } from "@/components/icons";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome to LifeHub"
        description="Choose a module to start preserving and organizing the important parts of your life."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.key}
              href={m.href}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-1 hover:shadow-lg"
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
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {m.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                Open module
                <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
