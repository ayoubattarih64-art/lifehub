"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocalStorage } from "@/lib/storage";
import { uid } from "@/lib/utils";
import type { MemoryBook, MemoryPage } from "@/lib/types";
import { getTemplate } from "@/lib/memory-templates";
import { generatePdf } from "@/lib/pdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  PhotoUploader,
  SingleImageUploader,
} from "@/components/photo-uploader";
import {
  ChevronLeftIcon,
  PlusIcon,
  TrashIcon,
  DownloadIcon,
  BookOpenIcon,
} from "@/components/icons";

export default function MemoryBookEditor() {
  const params = useParams<{ id: string }>();
  const [books, setBooks, hydrated] = useLocalStorage<MemoryBook[]>(
    "memory-books",
    []
  );

  const book = useMemo(
    () => books.find((b) => b.id === params.id),
    [books, params.id]
  );

  function update(mutator: (b: MemoryBook) => MemoryBook) {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === params.id
          ? { ...mutator(b), updatedAt: new Date().toISOString() }
          : b
      )
    );
  }

  function addPage() {
    const page: MemoryPage = {
      id: uid("page"),
      heading: "",
      text: "",
      images: [],
    };
    update((b) => ({ ...b, pages: [...b.pages, page] }));
  }

  function updatePage(pageId: string, patch: Partial<MemoryPage>) {
    update((b) => ({
      ...b,
      pages: b.pages.map((p) => (p.id === pageId ? { ...p, ...patch } : p)),
    }));
  }

  function removePage(pageId: string) {
    update((b) => ({ ...b, pages: b.pages.filter((p) => p.id !== pageId) }));
  }

  function exportPdf() {
    if (!book) return;
    const t = getTemplate(book.template);
    generatePdf({
      title: book.title,
      subtitle: book.subtitle || t.name,
      accent: t.accent,
      cover: book.coverImage,
      footer: "Created with LifeHub",
      sections: book.pages.map((p) => ({
        heading: p.heading || undefined,
        body: p.text || undefined,
        images: p.images,
      })),
    });
  }

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!book) {
    return (
      <EmptyState
        icon={BookOpenIcon}
        title="Book not found"
        description="This memory book may have been deleted."
        action={
          <Button href="/memory-books" variant="outline">
            Back to Memory Books
          </Button>
        }
      />
    );
  }

  const t = getTemplate(book.template);

  return (
    <div className="space-y-6">
      <Link
        href="/memory-books"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        All books
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${t.gradient} text-2xl`}
          >
            {t.emoji}
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{book.title}</h1>
            <p className="text-sm text-muted-foreground">
              {t.name}
              {book.subtitle ? ` · ${book.subtitle}` : ""}
            </p>
          </div>
        </div>
        <Button onClick={exportPdf} disabled={book.pages.length === 0}>
          <DownloadIcon className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Book details */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Book details</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input
                value={book.title}
                onChange={(e) => update((b) => ({ ...b, title: e.target.value }))}
              />
            </Field>
            <Field label="Subtitle">
              <Input
                value={book.subtitle}
                onChange={(e) =>
                  update((b) => ({ ...b, subtitle: e.target.value }))
                }
              />
            </Field>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">Cover image</p>
            <SingleImageUploader
              image={book.coverImage}
              onChange={(img) => update((b) => ({ ...b, coverImage: img }))}
              label="Upload cover"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pages */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Pages{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({book.pages.length})
          </span>
        </h2>
        <Button variant="outline" size="sm" onClick={addPage}>
          <PlusIcon className="h-4 w-4" />
          Add page
        </Button>
      </div>

      {book.pages.length === 0 ? (
        <EmptyState
          title="No pages yet"
          description="Add your first page with a heading, story and photos."
          action={
            <Button onClick={addPage}>
              <PlusIcon className="h-4 w-4" />
              Add page
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {book.pages.map((page, idx) => (
            <Card key={page.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-0">
                <span className="text-sm font-semibold text-muted-foreground">
                  Page {idx + 1}
                </span>
                <button
                  onClick={() => removePage(page.id)}
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500"
                  aria-label="Delete page"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <Field label="Heading">
                  <Input
                    value={page.heading}
                    onChange={(e) =>
                      updatePage(page.id, { heading: e.target.value })
                    }
                    placeholder="The big day"
                  />
                </Field>
                <Field label="Story">
                  <Textarea
                    value={page.text}
                    onChange={(e) =>
                      updatePage(page.id, { text: e.target.value })
                    }
                    placeholder="Write the story behind this page…"
                  />
                </Field>
                <div>
                  <p className="mb-1.5 text-sm font-medium">Photos</p>
                  <PhotoUploader
                    images={page.images}
                    onChange={(images) => updatePage(page.id, { images })}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
